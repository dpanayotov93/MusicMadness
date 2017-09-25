function Bullet(name) {
    this.sprite = new createjs.Bitmap(bullet_spritesheet);
    this.speed = 500;
    this.shoot = function() {
        var bullet = this.sprite;
        bullet.x = player.model.x + player.model._bounds.width / 3;
        bullet.y = player.model.y + player.model._bounds.height / 2;
        stage.addChild(bullet);
        this.update(bullet);
    };
    this.update = function(bullet) {
        var speed = this.speed,
            targetX  = player.mouse.x - bullet.x,
            targetY  = player.mouse.y - bullet.y,
            rotation = Math.atan2(targetY, targetX) * 180 / Math.PI;  

        bullet.rotation = rotation;
        createjs.Tween.get(bullet).to({x: player.mouse.x, y: player.mouse.y}, speed, createjs.Ease.linear).call(function() {
           stage.removeChild(bullet);
        });
    };
}