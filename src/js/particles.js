var canv = document.querySelector('canvas'),
    ctx = canv.getContext("2d"),
    W = canv.width - canv.width / 3, 
    H = canv.height - canv.height / 1.5,
    bg_particles = [],
    particle_no = 24;


function particle(){
  this.x = Math.floor(Math.random() * W);
  this.y = Math.floor(Math.random() * H - H/1.5);
  
  this.vx = Math.random() * 7;
  this.vy = Math.random() * 7;
  
  this.radius = 4;
  
  this.draw = function(){
    ctx.fillStyle = "transparent";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
    ctx.fill();
  }
}

for(var i=0;i<particle_no;i++){
  bg_particles.push(new particle());
}

function drawParticles(){
  for(var i=0;i<bg_particles.length;i++){
    bg_particles[i].draw();
  }
  
  update();
}

function update(){
  for(var i=0;i<bg_particles.length;i++){
    p = bg_particles[i];
    
    p.x += p.vx;
    p.y += p.vy;
    
    if(p.x > W || p.x < 0){
      p.vx = -p.vx;
    }
    
    if(p.y > H || p.y < 0){
      p.vy = -p.vy;
    }
    
    for(var l=0;l<bg_particles.length;l++){
      p2 = bg_particles[l];
      var counter = 0;
      var dist,
		    dx = p.x - p2.x;
		    dy = p.y - p2.y;
	      dist = Math.sqrt(dx*dx + dy*dy);
      
      if(dist>0 && dist<=12){
        p.vx = -p.vx;
        p.vy = -p.vy;
      }
      var rand_no = Math.random();
      if(rand_no>0.9){
        ctx.beginPath();
        ctx.moveTo(p.x,p.y);
        ctx.lineTo(p2.x,p2.y);
        var rand2 = Math.random();
        if(rand2 < 0.3){
          ctx.strokeStyle = "rgba(222,40,"+Math.round(Math.random()*255)+",0.3)";
        }
        else if(rand2>0.3 && rand2<0.6){
          ctx.strokeStyle = "rgba(250,"+Math.round(Math.random()*255)+",122,0.3)";
        }
        else if(rand2>0.6){
          ctx.strokeStyle = "rgba("+Math.round(Math.random()*255)+",70,62,0.3)";
        }
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}