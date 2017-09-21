function Bullet(name) {
    this.sprite = new createjs.Bitmap(bullet_spritesheet);
    this.speed = 500;
    this.shoot = function() {
        var bullet = this.sprite;
        bullet.x = player.model.x - player.model._bounds.width / 2;
        bullet.y = player.model.y - player.model._bounds.height / 2;
        stage.addChild(bullet);
        this.update(bullet);
    };
    this.update = function(bullet) {
        var speed = this.speed;
        createjs.Tween.get(bullet).to({x: player.mouse.x, y: player.mouse.y}, speed, createjs.Ease.linear).call(function() {
           stage.removeChild(bullet);
        });
    };
}