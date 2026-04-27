const getClientIp = (req) => {
  const forwardedForHeader = req.headers['x-forwarded-for']

  if (typeof forwardedForHeader === 'string' && forwardedForHeader.trim()) {
    return forwardedForHeader.split(',')[0].trim()
  }

  return req.ip || req.socket?.remoteAddress || 'unknown'
}

const getAuthenticatedKey = (req) => String(req.user?.userId || getClientIp(req))

const pruneExpiredEntries = (store, now) => {
  for (const [key, entry] of store.entries()) {
    if (!entry || entry.expiresAt <= now) {
      store.delete(key)
    }
  }
}

const createRateLimiter = ({
  windowMs,
  max,
  message = 'Too many requests. Please try again later.',
  keyGenerator = getClientIp,
} = {}) => {
  if (!Number.isInteger(windowMs) || windowMs < 1000) {
    throw new Error('createRateLimiter requires a windowMs value of at least 1000.')
  }

  if (!Number.isInteger(max) || max < 1) {
    throw new Error('createRateLimiter requires a max value of at least 1.')
  }

  const store = new Map()

  return (req, res, next) => {
    const now = Date.now()
    pruneExpiredEntries(store, now)

    const key = String(keyGenerator(req) || 'unknown')
    const currentEntry = store.get(key)

    if (!currentEntry || currentEntry.expiresAt <= now) {
      store.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      })

      return next()
    }

    if (currentEntry.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((currentEntry.expiresAt - now) / 1000))

      res.set('Retry-After', String(retryAfterSeconds))

      return res.status(429).json({
        success: false,
        message,
      })
    }

    currentEntry.count += 1
    store.set(key, currentEntry)
    return next()
  }
}

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many API requests from this client. Please slow down and try again shortly.',
})

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please wait before trying again.',
})

const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: 'Too many password reset attempts. Please try again later.',
})

const emailActionLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many email-triggering actions. Please wait before sending more.',
  keyGenerator: getAuthenticatedKey,
})

const writeActionLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 120,
  message: 'Too many write operations. Please slow down and try again.',
  keyGenerator: getAuthenticatedKey,
})

const destructiveActionLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'Too many destructive actions. Please wait before trying again.',
  keyGenerator: getAuthenticatedKey,
})

const bulkActionLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: 'Too many bulk operations. Please wait before uploading again.',
  keyGenerator: getAuthenticatedKey,
})

module.exports = {
  apiLimiter,
  authLimiter,
  bulkActionLimiter,
  createRateLimiter,
  destructiveActionLimiter,
  emailActionLimiter,
  getAuthenticatedKey,
  getClientIp,
  passwordResetLimiter,
  writeActionLimiter,
}
