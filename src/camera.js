import * as THREE from "three";

export function createCamera(gameWindow) {
  const DEG2RAD = Math.PI / 180.0;

  const LEFT_MOUSE_BUTTON = 0;
  const MIDDLE_MOUSE_BUTTON = 1;
  const RIGHT_MOUSE_BUTTON = 2;

  // Camera constraints for different modes
  const MIN_CAMERA_RADIUS = 8;  // Closer minimum for better building placement
  const MAX_CAMERA_RADIUS = 60; // Further maximum for overview
  const MIN_CAMERA_ELEVATION = 20; 
  const MAX_CAMERA_ELEVATION = 85; 

  const BUILDING_PLACEMENT_RADIUS = 50; 
  const BUILDING_PLACEMENT_ELEVATION = 80; 

  const ROTATION_SENSITIVITY = 0.5;
  const ZOOM_SENSITIVITY = 0.02;
  const PAN_SENSITIVITY = -0.01;
  const DRAG_THRESHOLD = 5; 

  const Y_AXIS = new THREE.Vector3(0, 1, 0);

  const camera = new THREE.PerspectiveCamera(
    75,
    gameWindow.offsetWidth / gameWindow.offsetHeight,
    0.1,
    1000
  );

  let cameraOrigin = new THREE.Vector3();
  let cameraRadius = (MIN_CAMERA_RADIUS + MAX_CAMERA_RADIUS) / 2;
  let cameraAzimuth = 135;
  let cameraElevation = 45;

  let isLeftMouseDown = false;
  let isRightMouseDown = false;
  let isMiddleMouseDown = false;

  let prevMouseX = 0;
  let prevMouseY = 0;
  let isDragging = false; 
  let buildingPlacementMode = false; 

  updateCameraPosition();

  function onMouseDown(event) {
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;

    if (event.button === LEFT_MOUSE_BUTTON) {
      isLeftMouseDown = true;
      isDragging = false; 
    }
    if (event.button === RIGHT_MOUSE_BUTTON) {
      isRightMouseDown = true;
    }
    if (event.button === MIDDLE_MOUSE_BUTTON) {
      isMiddleMouseDown = true;
    }
  }

  function onMouseUp(event) {
    if (event.button === LEFT_MOUSE_BUTTON) {
      isLeftMouseDown = false;
    }
    if (event.button === RIGHT_MOUSE_BUTTON) {
      isRightMouseDown = false;
    }
    if (event.button === MIDDLE_MOUSE_BUTTON) {
      isMiddleMouseDown = false;
    }
  }

  function onMouseMove(event) {
    const deltaX = event.clientX - prevMouseX;
    const deltaY = event.clientY - prevMouseY;

    if (isLeftMouseDown && !buildingPlacementMode) {
      const totalDelta = Math.abs(deltaX) + Math.abs(deltaY);
      if (!isDragging && totalDelta > DRAG_THRESHOLD) {
        isDragging = true;
      }
      if (isDragging) {
        cameraAzimuth += deltaX * ROTATION_SENSITIVITY;
        cameraElevation += deltaY * ROTATION_SENSITIVITY;

        cameraElevation = Math.min(
          MAX_CAMERA_ELEVATION,
          Math.max(MIN_CAMERA_ELEVATION, cameraElevation)
        );
        updateCameraPosition();
      }
    }

    if (isRightMouseDown) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        Y_AXIS,
        cameraAzimuth * DEG2RAD
      );
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(
        Y_AXIS,
        cameraAzimuth * DEG2RAD
      );
      const panMultiplier = buildingPlacementMode ? PAN_SENSITIVITY * 1.5 : PAN_SENSITIVITY;
      cameraOrigin.add(forward.multiplyScalar(panMultiplier * deltaY));
      cameraOrigin.add(left.multiplyScalar(panMultiplier * deltaX));
      updateCameraPosition();
    }

    if (isMiddleMouseDown) {
      let zoomMultiplier = ZOOM_SENSITIVITY;
      if (buildingPlacementMode) {
        zoomMultiplier = ZOOM_SENSITIVITY * 1.5;
      }
      cameraRadius += deltaY * zoomMultiplier;
      cameraRadius = Math.max(
        MIN_CAMERA_RADIUS,
        Math.min(MAX_CAMERA_RADIUS, cameraRadius)
      );
      updateCameraPosition();
    }

    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
  }

  function updateCameraPosition() {
    camera.position.x =
      cameraRadius * 
        Math.sin(cameraAzimuth * DEG2RAD) *
        Math.cos(cameraElevation * DEG2RAD) +
      cameraOrigin.x;
    camera.position.y =
      cameraRadius * Math.sin(cameraElevation * DEG2RAD) + cameraOrigin.y;
    camera.position.z =
      cameraRadius *
        Math.cos(cameraAzimuth * DEG2RAD) *
        Math.cos(cameraElevation * DEG2RAD) +
      cameraOrigin.z;

    camera.lookAt(cameraOrigin);
    camera.updateProjectionMatrix();
  }

  function setBuildingPlacementCamera() {
    if (buildingPlacementMode) {
      cameraRadius = BUILDING_PLACEMENT_RADIUS;
      cameraElevation = BUILDING_PLACEMENT_ELEVATION;
      updateCameraPosition();
    }
  }

  function resetCamera() {
    cameraRadius = (MIN_CAMERA_RADIUS + MAX_CAMERA_RADIUS) / 2;
    cameraAzimuth = 135;
    cameraElevation = 45;
    cameraOrigin.set(0, 0, 0);
    updateCameraPosition();
  }

  function setTopDownView() {
    cameraAzimuth = 0;
    cameraElevation = 85;
    cameraRadius = 25;
    updateCameraPosition();
  }

  function setSideView() {
    cameraAzimuth = 90;
    cameraElevation = 0;
    cameraRadius = 20;
    updateCameraPosition();
  }

  // 🔥 New Feature: focus on specific blog/tile
  function focusOnTile(tileX, tileY, size, zoom = true) {
    const half = size / 2;
    const worldX = tileX - half + 0.5;
    const worldZ = tileY - half + 0.5;
    cameraOrigin.set(worldX, 0, worldZ);

    if (zoom) {
      cameraRadius = MIN_CAMERA_RADIUS + 2;
      cameraElevation = 60;
    } else {
      cameraRadius = 25;
      cameraElevation = 45;
    }
    updateCameraPosition();
  }

  return {
    camera,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    isStartingDrag: () => isLeftMouseDown && isDragging,
    hasMoved: () => isDragging,
    setBuildingPlacementMode: (enabled) => { 
      buildingPlacementMode = enabled; 
      if (enabled) {
        setBuildingPlacementCamera();
      }
    },
    resetCamera,
    setTopDownView,
    setSideView,
    setBuildingPlacementCamera,
    focusOnTile   // <<-- new feature return
  };
}
