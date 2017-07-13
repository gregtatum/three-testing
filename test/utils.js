function createCallLogger (key, calls) {
  switch (key) {
    case 'shaderSource':
      return ([shader, source, ...rest]) => {
        const shaderNameResults = source.match(/#define SHADER_NAME ()/)
        const name = Array.isArray(shaderNameResults) && shaderNameResults[1]
          ? shaderNameResults[1]
          : "Unknown shader source"
        calls.push([key, shader, name, ...rest])
      }
    break;
    default:
      return args => calls.push([key, ...args])
  }

}
function wrapInObserver (gl) {
  // Create a calls array that stores all of the calls made.
  const calls = []

  for (const key in gl) {
    if (typeof gl[key] === 'function') {
      const fn = gl[key].bind(gl)
      const logCall = createCallLogger(key, calls)
      gl[key] = (...args) => {
        logCall(args)
        return fn.apply(null, args)
      }
    }
  }

  Object.assign(gl, {
    __calls: calls,
    __getCallsSnapshot: () => {
      let snapshotText = ''
      calls.forEach(([name, ...args]) => {
        // Normalize the args across browser
        const normalizedArgs = args.map(arg => {
          return typeof arg === 'object' && !arg.length
            ? '[object Object]'
            : arg
        })
        snapshotText += `gl.${name}(${normalizedArgs.join(', ')})\n`
      })
      return snapshotText
    }
  })

  return gl
}

function isBrowser () {
  return typeof window === 'object' && window === this
}

exports.createObservableWebGLContext = function (width, height, options) {
  if (isBrowser()) {
    const canvas = document.createElement('canvas');
    canvas.width = width
    canvas.height = height
    const gl = canvas.getContext('webgl');
    return wrapInObserver(gl);
  }
  const gl = require('gl')(width, height, options)
  gl.canvas = {
    width,
    height,
    addEventListener: () => {},
    style: {},
  }
  return wrapInObserver(gl)
}

exports.polyfillWindow = function () {
  if (isBrowser()) {
    return
  }
  global.window = {
    addEventListener: () => {}
  }
}
