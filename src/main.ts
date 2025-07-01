import * as THREE from 'three'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xa0a0a0)

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 5, 10)

// Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
hemiLight.position.set(0, 20, 0)
scene.add(hemiLight)

const dirLight = new THREE.DirectionalLight(0xffffff)
dirLight.position.set(-3, 10, -10)
scene.add(dirLight)

// Ground
const groundGeo = new THREE.PlaneGeometry(200, 200)
const groundMat = new THREE.MeshPhongMaterial({ color: 0x228822 })
const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x = -Math.PI / 2
scene.add(ground)

// Race Track - extruded ring with thickness
const outerRadius = 18
const innerRadius = 12

const outerCircle = new THREE.Shape()
outerCircle.absarc(0, 0, outerRadius, 0, Math.PI * 2, false)

const innerHole = new THREE.Path()
innerHole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true)

outerCircle.holes.push(innerHole)

const extrudeSettings = {
  depth: 0.2,
  bevelEnabled: false,
}

const trackGeo = new THREE.ExtrudeGeometry(outerCircle, extrudeSettings)
const trackMat = new THREE.MeshPhongMaterial({ color: 0x555555 })
const track = new THREE.Mesh(trackGeo, trackMat)
track.rotation.x = -Math.PI / 2
track.position.y = 1 // raise by half height so it sits on ground

scene.add(track)

// Kart mesh - simple red box
const kartGeo = new THREE.BoxGeometry(1, 0.5, 2)
const kartMat = new THREE.MeshPhongMaterial({ color: 0xff0000 })
const kart = new THREE.Mesh(kartGeo, kartMat)
kart.position.y = 1.25 // slightly above track surface (track height 2 + kart half height 0.25)
scene.add(kart)

// Movement variables
let moveForward = false
let moveBackward = false
let turnLeft = false
let turnRight = false
let velocity = 0
const maxSpeed = 0.1
const acceleration = 0.005
const deceleration = 0.01
const turnSpeed = 0.03

// Keyboard handlers
window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW':
      moveForward = true
      break
    case 'KeyS':
      moveBackward = true
      break
    case 'KeyA':
      turnLeft = true
      break
    case 'KeyD':
      turnRight = true
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW':
      moveForward = false
      break
    case 'KeyS':
      moveBackward = false
      break
    case 'KeyA':
      turnLeft = false
      break
    case 'KeyD':
      turnRight = false
      break
  }
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)

  // Update velocity
  if (moveForward) velocity += acceleration
  else if (moveBackward) velocity -= acceleration
  else {
    if (velocity > 0) velocity -= deceleration
    else if (velocity < 0) velocity += deceleration
  }
  velocity = Math.min(maxSpeed, Math.max(-maxSpeed, velocity))

  // Rotate kart
  if (turnLeft) kart.rotation.y += turnSpeed
  if (turnRight) kart.rotation.y -= turnSpeed

  // Move kart forward based on rotation
  kart.position.x -= Math.sin(kart.rotation.y) * velocity
  kart.position.z -= Math.cos(kart.rotation.y) * velocity

  // Smooth camera follow
  const relativeCameraOffset = new THREE.Vector3(0, 5, 10)
  const cameraOffset = relativeCameraOffset.applyMatrix4(kart.matrixWorld)
  camera.position.lerp(cameraOffset, 0.1)
  camera.lookAt(kart.position)

  renderer.render(scene, camera)
}

animate()
