const test = require('tape')
const assertSnapshot = require('./snapshots')

const { createObservableWebGLContext } = require('./utils')
const {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} = require('three')

const WIDTH = 100
const HEIGHT = 200

test('WebGLRenderer snapshot test', t => {
  t.ok(true)
  const gl = createObservableWebGLContext(WIDTH, HEIGHT, { preserveDrawingBuffer: true })
  const scene = new Scene()
  const camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000)
  const renderer = new WebGLRenderer({
    context: gl,
    canvas: gl.canvas
  })
  renderer.setSize(150, 250)
  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new Mesh(geometry, material)
  scene.add(cube)
  camera.position.z = 5
  renderer.render(scene, camera)

  gl.clearColor(1, 0, 0, 1)
  const snapshot = gl.__getCallsSnapshot()
  assertSnapshot(t, snapshot)
  t.end()
})
