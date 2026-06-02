export function confetti(canvas: HTMLCanvasElement | null) {
  if (!canvas) return
  const cx = canvas.getContext('2d')
  if (!cx) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const cols = ['#E8382A','#3D3D3D','#D97706','#16A34A','#1D4ED8','#7E22CE']
  const pts = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 50,
    vx: (Math.random() - .5) * 1.8,
    vy: 2.2 + Math.random() * 3,
    r: 2.5 + Math.random() * 3.5,
    c: cols[Math.floor(Math.random() * cols.length)],
    a: Math.random() * Math.PI * 2,
    sa: (Math.random() - .5) * .15,
    rect: Math.random() > .45
  }))
  let rid: number
  ;(function tick() {
    cx.clearRect(0, 0, canvas.width, canvas.height)
    let any = false
    pts.forEach(p => {
      p.y += p.vy; p.x += p.vx; p.a += p.sa; p.vy += .055
      if (p.y < canvas.height + 20) any = true
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c
      if (p.rect) cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
      else { cx.beginPath(); cx.arc(0, 0, p.r, 0, Math.PI * 2); cx.fill() }
      cx.restore()
    })
    if (any) rid = requestAnimationFrame(tick)
    else cx.clearRect(0, 0, canvas.width, canvas.height)
  })()
}
