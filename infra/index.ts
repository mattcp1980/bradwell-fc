import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'

const config = new pulumi.Config()
const env = config.require('env')
const domain = config.require('domain')
const gcpConfig = new pulumi.Config('gcp')
const region = gcpConfig.require('region')
const project = gcpConfig.require('project')

const commonLabels = {
  project: 'bradwell-fc',
  env,
}

// ---------------------------------------------------------------------------
// Storage bucket - static frontend assets
// ---------------------------------------------------------------------------
const siteBucket = new gcp.storage.Bucket('site-bucket', {
  name: `bradwell-fc-site-${env}`,
  location: region.toUpperCase(),
  uniformBucketLevelAccess: true,
  website: {
    mainPageSuffix: 'index.html',
    notFoundPage: 'index.html',
  },
  labels: commonLabels,
})

// Make bucket publicly readable
new gcp.storage.BucketIAMBinding('site-bucket-public', {
  bucket: siteBucket.name,
  role: 'roles/storage.objectViewer',
  members: ['allUsers'],
})

// ---------------------------------------------------------------------------
// Load balancer with CDN - serves the static site bucket
// Uses EXTERNAL_MANAGED scheme to support custom error response policies
// (required for SPA fallback: serve index.html on 404s from the bucket).
// ---------------------------------------------------------------------------
const backendBucket = new gcp.compute.BackendBucket('site-backend', {
  bucketName: siteBucket.name,
  enableCdn: true,
  cdnPolicy: {
    cacheMode: 'CACHE_ALL_STATIC',
    defaultTtl: 3600,
    maxTtl: 86400,
  },
})

// SPA fallback: when the bucket returns 404 for an unknown path (e.g. /admin),
// serve index.html with a 200 so React Router handles the route client-side.
const urlMap = new gcp.compute.URLMap('site-url-map', {
  defaultService: backendBucket.selfLink,
  defaultCustomErrorResponsePolicy: {
    errorResponseRules: [{
      matchResponseCodes: ['404'],
      path: '/index.html',
      overrideResponseCode: 200,
    }],
    errorService: backendBucket.selfLink,
  },
})

// ---------------------------------------------------------------------------
// HTTPS - managed SSL certificate + proxy on port 443
// ---------------------------------------------------------------------------
const sslCert = new gcp.compute.ManagedSslCertificate('site-ssl-cert', {
  managed: {
    domains: [domain],
  },
})

const httpsProxy = new gcp.compute.TargetHttpsProxy('site-https-proxy', {
  urlMap: urlMap.selfLink,
  sslCertificates: [sslCert.selfLink],
})

const globalAddress = new gcp.compute.GlobalAddress('site-ip', {
  labels: commonLabels,
})

// EXTERNAL_MANAGED scheme is required for advanced URL map features (custom error responses).
// Note: changing loadBalancingScheme requires replacing the forwarding rules.
new gcp.compute.GlobalForwardingRule('site-https-forwarding-rule', {
  target: httpsProxy.selfLink,
  ipAddress: globalAddress.address,
  portRange: '443',
  loadBalancingScheme: 'EXTERNAL_MANAGED',
})

// ---------------------------------------------------------------------------
// HTTP → HTTPS redirect
// ---------------------------------------------------------------------------
const redirectUrlMap = new gcp.compute.URLMap('site-http-redirect', {
  defaultUrlRedirect: {
    httpsRedirect: true,
    stripQuery: false,
  },
})

const httpProxy = new gcp.compute.TargetHttpProxy('site-http-proxy', {
  urlMap: redirectUrlMap.selfLink,
})

new gcp.compute.GlobalForwardingRule('site-forwarding-rule', {
  target: httpProxy.selfLink,
  ipAddress: globalAddress.address,
  portRange: '80',
  loadBalancingScheme: 'EXTERNAL_MANAGED',
})

// ---------------------------------------------------------------------------
// Pulumi state bucket (created once, managed outside normal stack lifecycle)
// Reference: gs://bradwell-fc-pulumi-state
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export const siteUrl = `https://${domain}`
export const bucketName = siteBucket.name
export const projectId = project
export const deployedRegion = region
