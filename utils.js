

function rotate(elem, startAngle, endAngle, speed) {
  var angle = startAngle;
  var id = setInterval(frame, 10);
  var clockwise = true
  if (startAngle > endAngle)
    clockwise = false

  function frame() {
    if ((clockwise && angle >= endAngle)
      || (!clockwise && angle <= endAngle)) {
      clearInterval(id);
    } else {
      if (clockwise) {
        angle += speed;
      } else {
        angle -= speed;
      }
      elem.style.transform = 'rotate(' + angle + 'deg)';
      // elem.style.width = width + 'px';
      // elem.style.height = width + 'px';
    }
  }
}

function resize(elem, startWidth, endWidth, speed) {
  var width = startWidth;
  var id = setInterval(frame, 10);
  var enlarge = true
  if (startWidth > endWidth)
    enlarge = false

  function frame() {
    if ((enlarge && width >= endWidth)
      || (!enlarge && width <= endWidth)) {
      clearInterval(id);
    } else {
      if (enlarge) {
        width += speed;
      } else {
        width -= speed;
      }
      elem.style.width = width + 'px';
      elem.style.height = width + 'px';
    }
  }
}

function enterLeft(elem) {
  moveX(elem, -elem.getBoundingClientRect().width, 0)
}

function exitLeft(elem) {
  moveX(elem, 0, -elem.getBoundingClientRect().width)
}

function enterTop(elem, speed) {
  moveY(elem, -elem.getBoundingClientRect().height, 0, speed)
}

function exitTop(elem, speed) {
  moveY(elem, 0, -elem.getBoundingClientRect().height, speed)
}

function enterBottom(elem, speed) {
  moveY(elem, 720, 720 - elem.getBoundingClientRect().height, speed)
}

function exitBottom(elem, speed) {
  moveY(elem, 720 - elem.getBoundingClientRect().height, 720, speed)
}

function bounce(elem, img) {
  var speed = 1
  var goingRight = Math.random() < 0.5
  var goingDown = Math.random() < 0.5

  // img.onload = function () {

    // alert(this.width + 'x' + this.height);
    var width = elem.offsetWidth
    var height = elem.offsetHeight

    var x = Math.floor(Math.random() * (1280 - width))
    var y = Math.floor(Math.random() * (720 - height))
    // console.log("x = " + x)
    // console.log("x = " + x)

    var counter = 0

    elem.style.left = x + 'px';
    elem.style.top = y + 'px';

    var id = setInterval(frame, 10);
    function frame() {

      counter++

      if(counter == 1000) {
        elem.remove()
        clearInterval(id)
      }

      if (goingRight) {
        x += speed;
        if (x + width >= 1280)
          goingRight = false
      }
      else {
        x -= speed;
        if (x <= 0)
          goingRight = true
      }


      if (goingDown) {
        y += speed;
        if (y + height >= 720)
          goingDown = false
      }
      else {
        y -= speed;
        if (y <= 0)
          goingDown = true
      }


      elem.style.left = x + 'px';
      elem.style.top = y + 'px';
    }



  // }


}

function moveX(elem, start, end) {
  var pos = start;
  var id = setInterval(frame, 10);
  var leftToRight = true
  if (start > end)
    leftToRight = false

  function frame() {
    if (pos == end) {
      clearInterval(id);
    } else {
      if (leftToRight)
        pos += 4;
      else
        pos -= 4;
      elem.style.left = pos + 'px';
    }
  }
}

function moveY(elem, start, end, speed) {
  var pos = start;
  var id = setInterval(frame, 10);
  var topToBottom = true
  if (start > end)
    topToBottom = false

  var id = setInterval(frame, 10);
  function frame() {
    if (pos == end) {
      clearInterval(id);
    } else {
      if (topToBottom)
        pos += speed;
      else
        pos -= speed;
      elem.style.top = pos + 'px';
    }
  }
}

function fadeInAudio(audio) {
  var tick = function () {
    audio.volume = +audio.volume + 0.01;
    if (+audio.volume < 0.1) {
      setTimeout(tick, 16)
    }
  };
  tick();
}

function fadeOutAudio(audio) {
  var tick = function () {
    audio.volume = +audio.volume - 0.01;
    if (+audio.volume > 0) {
      setTimeout(tick, 16)
    }
  };
  tick();
}

function fadeIn(el, speed = 0.001) {
  // el.style.opacity = 0;
  var tick = function () {
    el.style.opacity = +el.style.opacity + speed;
    if (+el.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
    }
  };
  tick();
}

function fadeOut(el, speed = 0.01) {
  // el.style.opacity = 0;
  var tick = function () {
    el.style.opacity = +el.style.opacity - speed;
    if (+el.style.opacity > 0) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
    }
  };
  tick();
}

function bounceWithFade(el, speed = 0.1) {
    fadeIn(el, speed)
    bounce(el)    
    setTimeout(function() {fadeOut(el, speed)}, 8_000);  
}

function hideFullImage() {
  fullImageWrapper.style.display = 'none';
}

function appendHtml(el, str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  while (div.children.length > 0) {
    el.appendChild(div.children[0]);
  }
}

function PlayVideo(srcVideo) {
  // console.log("video.html PlayVideo() srcVideo = " + srcVideo)
  document.querySelector("#videoID > source").src = srcVideo
  video.load();
  video.play();
  videoContainer.style.display = "block"
}