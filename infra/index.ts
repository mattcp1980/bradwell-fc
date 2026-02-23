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
    notFoundPage: 'index.html', // SPA fallback
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

const urlMap = new gcp.compute.URLMap('site-url-map', {
  defaultService: backendBucket.selfLink,
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

new gcp.compute.GlobalForwardingRule('site-https-forwarding-rule', {
  target: httpsProxy.selfLink,
  ipAddress: globalAddress.address,
  portRange: '443',
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

// Keep logical name 'site-forwarding-rule' so Pulumi updates the existing GCP resource
// in-place (retargets to redirect proxy) rather than creating a conflicting second rule.
new gcp.compute.GlobalForwardingRule('site-forwarding-rule', {
  target: httpProxy.selfLink,
  ipAddress: globalAddress.address,
  portRange: '80',
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
