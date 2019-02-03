var temp;
canvas.addEventListener("click", (e) => {
    temp = new renderObj(e.clientX - canvas.offsetTop, e.clientY - canvas.offsetLeft, "true")
    temp.setVelocity([-6 + Math.random() * 12, -6 + Math.random() * 12]);
    temp.addForce(gravity);
    engine.addItem(temp);
});
