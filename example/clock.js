var clock = document.createElement('h1')
document.body.appendChild(clock)
function update() {
  clock.textContent = new Date().toString()
}
setInterval(update, 1000)
update()


