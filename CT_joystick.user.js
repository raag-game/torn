// ==UserScript==
// @name         Torn CT Joystick
// @namespace    https://github.com/raag-game/torn
// @version      0.6
// @description  Adds a floating joystick to Torn and simulates arrow key presses on mobile with drag functionality via a small icon in the top-right corner
// @author       raag
// @match        https://www.torn.com/christmas_town.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Style for the joystick container
    const joystickContainer = document.createElement('div');
    joystickContainer.style.position = 'fixed';
    joystickContainer.style.bottom = '20px';
    joystickContainer.style.left = '20px';
    joystickContainer.style.zIndex = '9999';
    joystickContainer.style.width = '100px';
    joystickContainer.style.height = '100px';
    joystickContainer.style.background = 'rgba(0, 0, 0, 0.6)';
    joystickContainer.style.borderRadius = '50%';
    joystickContainer.style.display = 'flex';
    joystickContainer.style.justifyContent = 'center';
    joystickContainer.style.alignItems = 'center';
    joystickContainer.style.cursor = 'pointer';
    joystickContainer.style.touchAction = 'none';

    // Create inner joystick circle
    const joystick = document.createElement('div');
    joystick.style.width = '60px';
    joystick.style.height = '60px';
    joystick.style.background = 'rgba(255, 255, 255, 0.8)';
    joystick.style.borderRadius = '50%';
    joystick.style.position = 'relative';
    joystick.style.transition = 'transform 0.1s ease';

    joystickContainer.appendChild(joystick);

    // Create the drag icon
    const dragIcon = document.createElement('div');
    dragIcon.style.position = 'absolute';
    dragIcon.style.top = '0px';
    dragIcon.style.right = '0px';
    dragIcon.style.width = '15px';
    dragIcon.style.height = '15px';
    dragIcon.style.background = 'rgba(0, 0, 255, 0.8)';
    dragIcon.style.borderRadius = '50%';
    dragIcon.style.cursor = 'pointer';
    joystickContainer.appendChild(dragIcon);

    document.body.appendChild(joystickContainer);

    // Joystick Movement Variables
    let isMoving = false;
    let isDragging = false;
    let joystickCenterX = joystickContainer.offsetLeft + joystickContainer.offsetWidth / 2;
    let joystickCenterY = joystickContainer.offsetTop + joystickContainer.offsetHeight / 2;
    let joystickRadius = joystickContainer.offsetWidth / 2;
    let dragTimeout = null;

    let keyPressed = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    // Handle touch events for the inner joystick circle
    joystick.addEventListener('touchstart', (event) => {
        isMoving = true;
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        moveJoystick(touchX, touchY);
    });

    joystick.addEventListener('touchmove', (event) => {
        if (!isMoving) return;
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        moveJoystick(touchX, touchY);
    });

    joystick.addEventListener('touchend', () => {
        isMoving = false;
        joystick.style.transform = 'translate(0, 0)';
        resetKeyPress();
    });

    // Handle touch events for dragging the joystick container
    dragIcon.addEventListener('touchstart', (event) => {
        // Start a 1-second timer when the user touches the drag icon
        dragTimeout = setTimeout(() => {
            enableDragMode();
        }, 1000); // 1 second hold to activate drag mode
    });

    dragIcon.addEventListener('touchend', () => {
        clearTimeout(dragTimeout); // If the touch is released before 1 second, cancel the drag mode
        if (isDragging) {
            // If dragging was activated, we reset the drag mode
            isDragging = false;
        }
    });

    // Handle touch events for moving the joystick container
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    joystickContainer.addEventListener('touchmove', (event) => {
        if (isDragging) {
            const touchX = event.touches[0].clientX;
            const touchY = event.touches[0].clientY;
            moveJoystickContainer(touchX, touchY);
        }
    });

    joystickContainer.addEventListener('touchend', () => {
        stopDragging();
    });

    function moveJoystickContainer(touchX, touchY) {
        // Set the new position of the joystick container
        joystickContainer.style.left = `${touchX - dragOffsetX}px`;
        joystickContainer.style.top = `${touchY - dragOffsetY}px`;

        // Update joystick center position to follow the new container position
        joystickCenterX = joystickContainer.offsetLeft + joystickContainer.offsetWidth / 2;
        joystickCenterY = joystickContainer.offsetTop + joystickContainer.offsetHeight / 2;
    }

    function enableDragMode() {
        // Change joystick color to blue to indicate drag mode is active
        joystick.style.background = 'rgba(0, 0, 255, 0.8)';
        joystickContainer.style.transition = 'none'; // Disable transition during drag

        // Enable dragging
        isDragging = true;
    }

    function startDragging(touchX, touchY) {
        // Calculate the offset between the joystick container and the touch point
        dragOffsetX = touchX - joystickContainer.offsetLeft;
        dragOffsetY = touchY - joystickContainer.offsetTop;

        // Disable the transition effect during drag
        joystickContainer.style.transition = 'none';
        isDragging = true;
    }

    function stopDragging() {
        // Re-enable the transition effect after dragging ends
        joystickContainer.style.transition = 'transform 0.2s ease';
        isDragging = false;

        // Optionally reset the joystick color back to normal after dragging stops
        joystick.style.background = 'rgba(255, 255, 255, 0.8)';
    }

    // Function to move the inner joystick circle
    function moveJoystick(touchX, touchY) {
        const distanceX = touchX - joystickCenterX;
        const distanceY = touchY - joystickCenterY;
        const distance = Math.min(Math.sqrt(distanceX ** 2 + distanceY ** 2), joystickRadius);

        const angle = Math.atan2(distanceY, distanceX);
        const offsetX = distance * Math.cos(angle);
        const offsetY = distance * Math.sin(angle);

        joystick.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

        // Simulate arrow key presses based on joystick movement
        simulateKeyPress(offsetX, offsetY);
    }

    // Simulate key press
    function simulateKeyPress(x, y) {
        // Preventing repeated keydown events for the same key
        // Horizontal movement (Left / Right)
        if (x < -30 && !keyPressed.ArrowLeft) {
            dispatchKeyEvent('keydown', 'ArrowLeft');
            keyPressed.ArrowLeft = true;
        } else if (x >= -30 && x <= 30 && keyPressed.ArrowLeft) {
            dispatchKeyEvent('keyup', 'ArrowLeft');
            keyPressed.ArrowLeft = false;
        }

        if (x > 30 && !keyPressed.ArrowRight) {
            dispatchKeyEvent('keydown', 'ArrowRight');
            keyPressed.ArrowRight = true;
        } else if (x <= 30 && x >= -30 && keyPressed.ArrowRight) {
            dispatchKeyEvent('keyup', 'ArrowRight');
            keyPressed.ArrowRight = false;
        }

        // Vertical movement (Up / Down)
        if (y < -30 && !keyPressed.ArrowUp) {
            dispatchKeyEvent('keydown', 'ArrowUp');
            keyPressed.ArrowUp = true;
        } else if (y >= -30 && y <= 30 && keyPressed.ArrowUp) {
            dispatchKeyEvent('keyup', 'ArrowUp');
            keyPressed.ArrowUp = false;
        }

        if (y > 30 && !keyPressed.ArrowDown) {
            dispatchKeyEvent('keydown', 'ArrowDown');
            keyPressed.ArrowDown = true;
        } else if (y <= 30 && y >= -30 && keyPressed.ArrowDown) {
            dispatchKeyEvent('keyup', 'ArrowDown');
            keyPressed.ArrowDown = false;
        }

        // Reset keypresses when joystick is near the center
        if (Math.abs(x) < 30 && Math.abs(y) < 30) {
            resetKeyPress();
        }
    }

    // Dispatch key event
    function dispatchKeyEvent(eventType, key) {
        const event = new KeyboardEvent(eventType, {
            key: key,
            code: key,
            keyCode: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : key === 'ArrowUp' ? 38 : 40,
            which: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : key === 'ArrowUp' ? 38 : 40
        });
        document.dispatchEvent(event);
    }

    // Reset keypress
    function resetKeyPress() {
        // If joystick is at center, stop all keypresses
        for (const key in keyPressed) {
            if (keyPressed[key]) {
                dispatchKeyEvent('keyup', key);
                keyPressed[key] = false;
            }
        }
    }

})();
