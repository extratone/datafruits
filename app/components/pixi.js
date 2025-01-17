// snow from https://codepen.io/jh3y/pen/VdMBaR
import Component from '@glimmer/component';
import { action } from '@ember/object';
import * as PIXI from 'pixi.js';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default class PixiComponent extends Component {
  @service eventBus;

  filter;
  background;
  app;
  sprites = [];
  animations = {};

  fruits = ['strawberry', 'lemon', 'orange', 'banana', 'watermelon', 'cabbage'];

  constructor() {
    super(...arguments);
    this.eventBus.subscribe('fruitTipped', this, 'addFruitTip');
  }

  addFruitTip(event) {
    if (this.app) {
      let animation;
      if (this.fruits.includes(event)) {
        animation = event;
      } else {
        console.log(`invalid fruit: ${event}`); // eslint-disable-line no-console
      }
      let sprite = new PIXI.AnimatedSprite(this.animations[animation]);
      sprite.scale.x = 0.25;
      sprite.scale.y = 0.25;
      sprite.x = Math.random() * this.app.screen.width;
      sprite.y = Math.random() * this.app.screen.height;

      sprite.animationSpeed = Math.random() * 2;
      sprite.rotation = Math.floor(Math.random() * 360);
      let randomFrame = Math.floor(Math.random() * sprite.totalFrames);
      sprite.gotoAndPlay(randomFrame);

      this.sprites.pushObject(sprite);
      this.app.stage.addChild(sprite);
      // add callback to remove sprite after 5s
      later(() => {
        let x = sprite.x;
        let y = sprite.y;

        let starSprite = new PIXI.AnimatedSprite(this.animations['stars']);
        starSprite.x = x;
        starSprite.y = y;
        starSprite.animationSpeed = Math.random() * 2;
        let starScale = Math.random() * 2;
        starSprite.scale.x = starScale;
        starSprite.scale.y = starScale;
        sprite.destroy();
        let spriteIndex = this.sprites.indexOf(sprite);
        this.sprites.splice(spriteIndex, 1);

        // play star animation
        starSprite.loop = false;
        starSprite.play();
        this.app.stage.addChild(starSprite);
        later(() => {
          // remove star animation
          starSprite.destroy();
        }, 300);
      }, 5000);
    } else {
      console.log("pixi.js wasn't initialized..."); // eslint-disable-line no-console
    }
  }

  @action
  willDestroy() {
    super.willDestroy(...arguments);
    this.app.destroy({
      removeView: true,
    });
  }

  @action
  didInsert() {
    let type = 'WebGL';
    if (!PIXI.utils.isWebGLSupported()) {
      type = 'canvas';
    }

    PIXI.utils.sayHello(type);

    this.app = new PIXI.Application({
      autoResize: true,
      resolution: devicePixelRatio,
      backgroundAlpha: 0,
    });

    document.body.appendChild(this.app.view);

    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    let _resize = () => {
      this.handleResize();
    };
    this._resize = _resize;
    window.addEventListener('resize', _resize);
    this.handleResize();

    this.app.stop();

    this.app.loader.add('strawberry', '/assets/images/sprites/strawberry.json');
    this.app.loader.add('orange', '/assets/images/sprites/orange.json');
    this.app.loader.add('lemon', '/assets/images/sprites/lemon.json');
    this.app.loader.add('banana', '/assets/images/sprites/banana.json');
    this.app.loader.add('watermelon', '/assets/images/sprites/watermelon.json');
    this.app.loader.add('cabbage', '/assets/images/sprites/cabbage.json');
    this.app.loader.add('shader', '/assets/shaders/shader.frag');

    this.app.loader.add('stars', '/assets/images/sprites/stars.json');
    this.app.loader.load((loader, res) => {
      this.filter = new PIXI.Filter(null, res.shader.data, {
        customUniform: 0.0,
      });

      this.animations.strawberry = res.strawberry.spritesheet.animations['strawberry2_wiggle.png'];
      this.animations.orange = res.orange.spritesheet.animations['orange.png'];
      this.animations.lemon = res.lemon.spritesheet.animations['lemon.webp'];
      this.animations.banana = res.banana.spritesheet.animations['banana.webp'];
      this.animations.watermelon = res.watermelon.spritesheet.animations['watermelon.webp'];
      this.animations.cabbage = res.cabbage.spritesheet.animations['cabbage.webp'];
      this.animations.stars = res.stars.spritesheet.animations['stars'];

      // Resume application update
      this.app.start();

      let count = 0;
      // Animate the filter
      this.app.ticker.add((delta) => {
        this.filter.uniforms.customUniform += delta;

        count += 0.02;

        this.sprites.forEach((sprite) => {
          sprite.x += Math.sin(count);
          sprite.y += Math.cos(count);
          sprite.scale.x += Math.sin(count) * 0.01;
          sprite.scale.y += Math.sin(count) * 0.01;
          sprite.rotation += Math.sin(count) * 0.01;
        });
      });
    });
  }

  handleResize() {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
  }
}
