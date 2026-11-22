/**
 * gameScene.js
 * Logika ketuk telur, menetas, perkenalan, dan beri makan.
 * Mesin status: EGG -> HATCH -> FEED -> (lanjut) -> EGG
 */
(function (global) {
  'use strict';

  const { DINOS, FOODS, EGG_STAGES } = global.DinoData;
  const CFG = global.GameConfig;

  class GameScene {
    constructor(audio) {
      this.audio = audio;
      this.taps = 0;
      this.current = null;
      this.currentIndex = -1;
      this.busy = false;
      this.timers = [];

      this.dom = {
        startScreen: document.getElementById('start-screen'),
        eggScene: document.getElementById('egg-scene'),
        hatchScene: document.getElementById('hatch-scene'),
        feedScene: document.getElementById('feed-scene'),
        egg: document.getElementById('egg'),
        eggImg: document.getElementById('egg-img'),
        tapDots: document.getElementById('tap-dots'),
        dinoHatch: document.getElementById('dino-hatch'),
        dinoFeed: document.getElementById('dino-feed'),
        dinoName: document.getElementById('dino-name'),
        foodButtons: document.getElementById('food-buttons'),
        continueBtn: document.getElementById('continue-btn')
      };

      this._bindEvents();
    }

    /* ---------- Util ---------- */

    _later(fn, ms) {
      const id = setTimeout(fn, ms);
      this.timers.push(id);
      return id;
    }

    _showScene(el) {
      [this.dom.eggScene, this.dom.hatchScene, this.dom.feedScene].forEach((s) => {
        s.classList.toggle('active', s === el);
      });
    }

    _restartAnim(el, cls) {
      el.classList.remove(cls);
      void el.offsetWidth; // force reflow agar animasi ulang
      el.classList.add(cls);
    }

    _setDino(el, dino) {
      el.innerHTML = '';
      const img = document.createElement('img');
      img.src = dino.image;
      img.alt = dino.name;
      img.draggable = false;
      el.appendChild(img);
    }

    /* ---------- Event ---------- */

    _bindEvents() {
      const egg = this.dom.egg;
      egg.addEventListener('click', () => this.onEggTap());
      egg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.onEggTap(); }
      });
      this.dom.continueBtn.addEventListener('click', () => this.nextRound());
    }

    /* ---------- Mulai / putaran baru ---------- */

    start() {
      this.dom.startScreen.classList.remove('active');
      this.nextRound();
    }

    nextRound() {
      this.busy = false;
      this.taps = 0;

      // Pilih dino acak, hindari pengulangan berturut-turut
      let idx;
      do {
        idx = Math.floor(Math.random() * DINOS.length);
      } while (idx === this.currentIndex && DINOS.length > 1);
      this.currentIndex = idx;
      this.current = DINOS[idx];

      // Reset telur & indikator
      this.dom.eggImg.src = EGG_STAGES[0];
      this.dom.egg.classList.remove('wobble', 'crack-shake', 'break');
      Array.from(this.dom.tapDots.children).forEach((d) => d.classList.remove('filled'));

      // Reset area makan
      this.dom.foodButtons.innerHTML = '';
      this.dom.continueBtn.classList.add('hidden');

      this._showScene(this.dom.eggScene);
    }

    /* ---------- Ketuk telur ---------- */

    onEggTap() {
      if (this.busy || !this.dom.eggScene.classList.contains('active')) return;

      this.taps++;
      this.audio.playTap();
      this._restartAnim(this.dom.egg, 'wobble');

      // Isi indikator ketukan
      const dots = Array.from(this.dom.tapDots.children);
      for (let i = 0; i < Math.min(this.taps, CFG.tapsToHatch); i++) {
        dots[i].classList.add('filled');
      }

      if (this.taps >= CFG.tapsToHatch) {
        this._breakEgg();
        return;
      }

      // Tahap retak: ketuk 1 -> utuh, 2 -> retak kecil, 3 -> retak besar
      const stage = this.taps === 2 ? 1 : this.taps === 3 ? 2 : 0;
      const oldSrc = this.dom.eggImg.src;
      this.dom.eggImg.src = EGG_STAGES[stage];
      if (stage > 0 && EGG_STAGES[stage] !== oldSrc) {
        this.audio.playCrack();
        this._restartAnim(this.dom.egg, 'crack-shake');
      }
    }

    _breakEgg() {
      this.busy = true;
      this.audio.playShellBreak();
      this.dom.egg.classList.remove('wobble', 'crack-shake');
      this._restartAnim(this.dom.egg, 'break');
      this._later(() => this._hatch(), 520);
    }

    /* ---------- Menetas & perkenalan ---------- */

    _hatch() {
      this._setDino(this.dom.dinoHatch, this.current);
      this.dom.dinoName.textContent = this.current.name + '!';
      this.dom.dinoHatch.classList.remove('happy', 'shake');
      this._restartAnim(this.dom.dinoHatch, 'hop-in');

      this._showScene(this.dom.hatchScene);

      this._later(() => {
        this.audio.narrate(this.current.name, () => {
          this.audio.playRoar();
          this._later(() => this._showFeeding(), CFG.afterRoarDelayMs);
        });
      }, CFG.nameDelayMs);
    }

    /* ---------- Beri makan ---------- */

    _showFeeding() {
      this._setDino(this.dom.dinoFeed, this.current);
      this.dom.dinoFeed.classList.remove('happy', 'shake');

      const foods = this._buildFoodChoices();
      this.dom.foodButtons.innerHTML = '';
      foods.forEach((food) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'food-btn';
        btn.setAttribute('aria-label', food.label);

        const img = document.createElement('img');
        img.src = food.image;
        img.alt = '';
        img.draggable = false;
        const label = document.createElement('span');
        label.className = 'food-label';
        label.textContent = food.label;

        btn.appendChild(img);
        btn.appendChild(label);
        btn.addEventListener('click', () => this._onFoodChoice(btn, food.id));
        this.dom.foodButtons.appendChild(btn);
      });

      this._showScene(this.dom.feedScene);
      this.busy = false;
    }

    /** Dua tombol: makanan benar + satu pengganggu acak. Diacak urutannya. */
    _buildFoodChoices() {
      const correct = this.current.diet;
      const others = Object.keys(FOODS).filter((k) => k !== correct);
      const wrong = others[Math.floor(Math.random() * others.length)];
      const choices = [FOODS[correct], FOODS[wrong]];
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
      }
      return choices;
    }

    _onFoodChoice(btn, foodId) {
      if (this.busy || !this.dom.feedScene.classList.contains('active')) return;
      this.busy = true;

      this.dom.foodButtons.querySelectorAll('.food-btn').forEach((b) => {
        b.disabled = true;
      });
      this.dom.dinoFeed.classList.remove('happy', 'shake');

      if (foodId === this.current.diet) {
        // BENAR
        btn.classList.add('correct-flash');
        this.audio.playChew();
        this._restartAnim(this.dom.dinoFeed, 'happy');
        this._later(() => this.audio.playHappy(), 280);
        this._later(() => {
          this.dom.continueBtn.classList.remove('hidden');
          this.busy = false;
        }, 720);
      } else {
        // SALAH — tanpa penalti, tanpa suara kasar
        btn.classList.add('wrong-flash');
        this.audio.playWrong();
        this._restartAnim(this.dom.dinoFeed, 'shake');
        this._later(() => {
          this.dom.foodButtons.querySelectorAll('.food-btn').forEach((b) => {
            b.disabled = false;
            b.classList.remove('wrong-flash');
          });
          this.busy = false;
        }, 620);
      }
    }
  }

  global.GameScene = GameScene;
})(window);
