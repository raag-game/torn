// ==UserScript==
// @name         Torn CT Joystick
// @namespace    https://github.com/raag-game/torn
// @version      0.2
// @description  Adds a floating joystick to Torn and simulates arrow key presses on mobile
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
    document.body.appendChild(joystickContainer);

    // Joystick Movement Variables
    let isMoving = false;
    let joystickCenterX = joystickContainer.offsetLeft + joystickContainer.offsetWidth / 2;
    let joystickCenterY = joystickContainer.offsetTop + joystickContainer.offsetHeight / 2;
    let joystickRadius = joystickContainer.offsetWidth / 2;

    let keyPressed = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    // Handle touch events
    joystickContainer.addEventListener('touchstart', (event) => {
        isMoving = true;
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        moveJoystick(touchX, touchY);
    });

    joystickContainer.addEventListener('touchmove', (event) => {
        if (!isMoving) return;
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        moveJoystick(touchX, touchY);
    });

    joystickContainer.addEventListener('touchend', () => {
        isMoving = false;
        joystick.style.transform = 'translate(0, 0)';
        resetKeyPress();
    });

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

    function simulateKeyPress(x, y) {
        // Horizontal movement (Left / Right)
        if (x < -30 && !keyPressed.ArrowLeft) {
            dispatchKeyEvent('keydown', 'ArrowLeft');
            keyPressed.ArrowLeft = true;
        } else if (x > 30 && !keyPressed.ArrowRight) {
            dispatchKeyEvent('keydown', 'ArrowRight');
            keyPressed.ArrowRight = true;
        }

        // Vertical movement (Up / Down)
        if (y < -30 && !keyPressed.ArrowUp) {
            dispatchKeyEvent('keydown', 'ArrowUp');
            keyPressed.ArrowUp = true;
        } else if (y > 30 && !keyPressed.ArrowDown) {
            dispatchKeyEvent('keydown', 'ArrowDown');
            keyPressed.ArrowDown = true;
        }

        // Reset keypresses when joystick is near the center
        if (Math.abs(x) < 30 && Math.abs(y) < 30) {
            resetKeyPress();
        }
    }

    function dispatchKeyEvent(eventType, key) {
        const event = new KeyboardEvent(eventType, {
            key: key,
            code: key,
            keyCode: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : key === 'ArrowUp' ? 38 : 40,
            which: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : key === 'ArrowUp' ? 38 : 40
        });
        document.dispatchEvent(event);
    }

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
