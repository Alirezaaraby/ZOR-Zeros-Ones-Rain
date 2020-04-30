var canvas = document.getElementById("main");
var processing = new Processing(canvas, function(processing) {
  var canvasSize = 400;
  processing.size(canvasSize, canvasSize);
  processing.background(0xFFF);

  // canvas.drawImage("https://picsum.photos/200", 4, 5);


  var mouseIsPressed = false;
  processing.mousePressed = function () { mouseIsPressed = true; };
  processing.mouseReleased = function () { mouseIsPressed = false; };

  var keyIsPressed = false;
  processing.keyPressed = function () { keyIsPressed = true; };
  processing.keyReleased = function () { keyIsPressed = false; };



  with (processing) {
  ////    Display Rules     ////

  /*
      A random character is created
      This character appears at the top of the screen and runs downward like a raindrop
      The character leaves a fading trail behind it
      The character randomizes every update

      From wikipedia, the description of the code:
      In the film, the code that comprises the Matrix itself is frequently represented as downward-flowing
      green characters. This code includes mirror images of half-width kana characters and Latin letters and
      numerals. The effect resembles that of the older green screen displays, since the letters leave a
      fluorescent trace on the screen.
  */


  ////    Debugging   ////

  //  good values: codeSize 10, codeSpeed 40, maxParticles 75
  var codeSize = 10;
  var codeSpeed = 40;
  var maxParticles = 75;
  var chars = "01010100 01111001 01100011 01101000 0110111";
  // var chars = "あかさたなはまやらわがざだばぱいきしちにひみりゐぎじぢびぴうくすつうふむゆるぐずづぶぷえけせてねへめれゑげぜでべぺおこそとのほもよろをごぞどぼぽ1234567890123456789012345678901234567890123456789012345678901234567890";


  ////    Time    ////

  //  Tracks elapsed time between updates/draw calls
  var DeltaTime = function () {
      this.delta = 0;
      this.end = 0;
      this.start = millis();
  };
  DeltaTime.prototype.Update = function () {
      this.end = millis();
      this.delta = (this.end - this.start) / 1000;
      this.start = this.end;
      this.fps = 1/this.delta;
  };
  var dt = new DeltaTime();


  ////    Primative values with special properties    ////

  //  Append list2 to list1 and return list1
  var PushAll = function (L1, L2) {
      if (L2.length === 0) return L1;
    
      for (var i = L2.length ; i > 0 ; i--) {
          L1.push(L2[i-1]);
      }
      return L1;
  };


  ////    Recycling System    ////

  var Recycler = function () {};
  Recycler.prototype.Init = function () {
      this.items = [];
      this.newItems = [];
      this.deadItems = [];
  };
  Recycler.prototype.Update = function () {
      if (this.newItems.length > 0) {
          this.items = PushAll(this.items, this.newItems);
          this.newItems = [];
      }
      for (var i = this.items.length ; i > 0 ; i--) {
          var p = this.items[i-1];
          p.Update();
          if (p.IsDead()) {
              this.deadItems.push(p);
              this.items.splice(i-1,1);
          }
      }
  };
  Recycler.prototype.Draw = function () {
      for (var i = 0 ; i < this.items.length ; i++) {
          this.items[i].Draw();
      }
  };
  Recycler.prototype.Get = function () {

      if (this.deadItems.length > 0) {
          return this.deadItems.pop(this.deadItems.length -1);
      } else {
          return this.NewItem ();
      }
  };
  Recycler.prototype.Add = function (item) {
      this.newItems.push(item);
  };


  ////    Particle System     ////

  var RandomChar = function () {
      var position = random(1,chars.length) -1;
      return chars.substring(position, position+1);
  };

  var Particle = function () {
      this.char = "@";
  };
  Particle.prototype.Init = function () {
      this.speed = random(1, 10);
      var x = codeSize * floor(random() * width / codeSize);
      this.position = new PVector(x, -size * this.speed * random());
      this.char = RandomChar();
      this.deltaTime = random();
  };
  Particle.prototype.Update = function () {
      this.deltaTime += dt.delta * codeSpeed * this.speed;
      if (this.deltaTime > codeSize) {
          this.position.y += codeSize;
          this.deltaTime = 0;
          this.char = RandomChar();
      }
      if (this.position.y > height) {
          this.Init();

      }
  };
  Particle.prototype.IsDead = function () {
      return false;
  };
  Particle.prototype.Draw = function () {
      textSize(codeSize);
      textAlign(LEFT,BOTTOM);
      text(this.char, this.position.x, this.position.y);
  };
  Particle.prototype.DrawDark = function () {
      fill(0, 168, 0);
      this.Draw();
  };
  Particle.prototype.DrawLight = function () {
      fill(184, 255, 184);
      this.Draw();

  };


  ////    Matrix Code       ////

  var CodeSystem = function () {
      this.recycler = new Recycler();
      this.recycler.NewItem = function () {
          return new Particle();
      };
  };
  CodeSystem.prototype.Init = function () {
      this.recycler.Init();

      for (var i = 0 ; i < 1 + floor(maxParticles / 10) ; i++) {
      //for (var i = 0 ; i < maxParticles ; i++) {
          var codeCharacter = this.recycler.Get();
          codeCharacter.Init();
          this.recycler.Add(codeCharacter);
      }
  };
  CodeSystem.prototype.Update = function () {
      this.recycler.Update();
      if (this.recycler.items.length < maxParticles && random() < 0.25) {
          var codeCharacter = new Particle();
          codeCharacter.Init();
          this.recycler.Add(codeCharacter);
      }
  };
  CodeSystem.prototype.DrawDark = function () {
      for (var i = 0 ; i < this.recycler.items.length ; i++) {
          this.recycler.items[i].DrawDark();
      }
  };
  CodeSystem.prototype.DrawLight = function () {
      for (var i = 0 ; i < this.recycler.items.length ; i++) {
          this.recycler.items[i].DrawLight();
      }
  };
  var theMatrix = new CodeSystem();


  ////    Reset the simulation    ////

  var InitProgram = function () {
      fill(0, 0, 0);
      rect(0,0,width,height);
      theMatrix.Init();
  };

  ////    Overrides for built-in functions    ////

  var showCopyright = false;
  var drawCopyright = function () {
      var size = 10;
      textAlign(CENTER, CENTER);
      fill(255,255,255, 40);
      text("AlirezaAraby@IliyaZamany", width/2, height - 2 * size);
  };
  var showImage = true;
  var drawImage = function () {
      var ctx = document.getElementById('main').getContext('2d');
      var img = new Image();
      img.onload = function() {
          ctx.drawImage(img, width/2-img.width/2, height/2-img.height/2);
      };
      img.src = 'https://gitlab.com/Alirezaaraby/test/-/raw/master/Webp.net-resizeimage__15_.png';
  };

  draw = function() {
      fill(0, 0, 0, 10);
      rect(0,0,width,height);
      dt.Update();
      pushMatrix();
      translate(width,0);
      scale(-1,1);
      theMatrix.DrawDark();
      theMatrix.Update();
      theMatrix.DrawLight();
      popMatrix();
      if (showCopyright) {
          drawCopyright();
      }
      if (showImage) {
          drawImage();
      }
  };

  mouseClicked = function () {
      InitProgram();
  };

  keyTyped = function () {
      showCopyright = !showCopyright;
      showImage = !showImage;
  };

  ////    start the simulation    ////

  InitProgram();

  }
  if (typeof draw !== 'undefined') processing.draw = draw;
});