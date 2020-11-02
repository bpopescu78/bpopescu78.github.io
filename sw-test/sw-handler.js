// Register service worker
let swState = null

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw-test/sw.js', { scope: '/sw-test/' }).then(reg => {

      if (reg.waiting) {
        swStateChangeHandler(reg.waiting)
      }
      reg.addEventListener('updatefound', () => swStateChangeHandler(reg.installing))

    }).catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error);
    })
  })
}

const swStateChangeHandler = (newSW) => {
  newSW.onstatechange = () => {
    swStateChangeHandler(newSW)
  }

  swState = newSW.state

  const updateButton = document.querySelector('#swupdate>button')
  updateButton.style.display = 'none'
  updateButton.addEventListener('click', e => {
    newSW.postMessage('skipWaiting');
    e.stopPropagation()
    return void(0)
  })

  document.querySelector('#swupdate-status').innerHTML = newSW.state
  document.querySelector('#swupdate').style.display = 'block'

  switch (swState) {
    // "installing" - the install event has fired, but not yet complete
    // ...
    // "installed"  - install complete
    case 'installed':
      // ADD the logic here in order to activate the SW
      updateButton.style.display = 'inline'
      break
    // "activating" - the activate event has fired, but not yet complete
    // ...
    // "activated"  - fully active
    case 'activated':
      location.reload()
      break
  }
}

// Display available storage space in console.info
navigator.storage.estimate().then((info) => {
  console.info(`Quota: ${formatThousands(info.quota)} bytes`);
  console.info(`Usage: ${formatThousands(info.usage)} bytes`);
  console.info(`You’re currently using about ${(Math.ceil(info.usage / info.quota * 10000)/100).toFixed(2)}% of your available storage.`)
});

const formatThousands = (number, separatorChar = ',') => {
  const strNumber = number + ''
  return strNumber.split('')
    .map((char, index) => (strNumber.length - index) % 3 === 1 && index < strNumber.length - 1 
      ? `${char}${separatorChar}`
      : char
    )
    .join('')
}
