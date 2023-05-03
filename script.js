'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let type = inputType.value;
let distance = Number(inputDistance.value);
let duration = Number(inputDuration.value);

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  activ;
  constructor(coordinat, duration, distance) {
    this.coordinat = coordinat;
    this.duration = duration;
    this.distance = distance;
    this._setDescription();
    console.log(this.description);
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const activ = this.type;
    console.log(activ);
    console.log(this.type);

    this.description = `${type[0].toUpperCase()}${type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  // workoutDescription() {
  //   this.description = `${this.type} on ${
  //     months[this.date.getMonth()]
  //   } ${this.date.getDate()}`;
  // }
}

class Running extends Workout {
  type = `running`;
  constructor(coordinat, duration, distance, cadence) {
    super(coordinat, duration, distance);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = `cycling`;
  constructor(coordinat, duration, distance, elevator) {
    super(coordinat, duration, distance);
    this.elevator = elevator;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, 12], 5.2, 24, 178);
// console.log(run1);

// const run2 = new Cycling([39, 12], 5.2, 24, 178);
// console.log(run2);

class App {
  #mapZoomLevel = 10;
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    inputType.addEventListener(`change`, this._toggleElevationField);
    containerWorkouts.addEventListener(`click`, this._toPupUps.bind(this));

    this._getLocalStorage();
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert`Can not get position`;
        }
      );
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coord = [latitude, longitude];
    this.#map = L.map('map').setView(coord, this.#mapZoomLevel);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on(`click`, this._showForm.bind(this));
    console.log(this.#mapEvent);
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }
  _showForm(mapE) {
    form.classList.remove(`hidden`);
    inputDistance.focus();
    this.#mapEvent = mapE.latlng;
  }

  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }
  _newWorkout(e) {
    e.preventDefault();

    console.log(this.#mapEvent.latlng);

    // const { lat, lng } = this.#mapEvent.latlng;

    //get data ftom form

    type = inputType.value;
    distance = Number(inputDistance.value);
    duration = Number(inputDuration.value);
    let workout;

    console.log(distance, duration);

    //check data is valid
    const checkvalid = (...input) => input.every(inp => Number.isFinite(inp));
    const chekPositive = (...input) => input.every(inp => inp > 0);

    //if running create running
    if (type === `running`) {
      const cadence = +inputCadence.value;
      if (
        !checkvalid(distance, duration, cadence) ||
        !chekPositive(distance, duration, cadence)
      ) {
        alert`Not a positive number`;
      }
      workout = new Running(this.#mapEvent, duration, distance, cadence);
    }
    //if cycling creatr cycling
    if (type === `cycling`) {
      const elevation = +inputElevation.value;
      if (
        !checkvalid(distance, duration, elevation) ||
        !chekPositive(distance, duration)
      ) {
        alert`Not a positive number`;
      }
      // console.log(this.#mapEvent.latlng);
      workout = new Cycling(this.#mapEvent, duration, distance, elevation);
    }

    //add new object to workout array
    this.#workouts.push(workout);
    // console.log(workout);

    this._renderWorkout(workout);

    this._renderWorkoutMarker(workout);

    this._hideForm();

    this._setLocalStorage();

    //render workout on map as marker

    // L.marker(this.#mapEvent)
    //   .addTo(this.#map)
    //   .bindPopup(
    //     L.popup({
    //       maxWidth: 350,
    //       minWidth: 50,
    //       autoClose: false,
    //       closeOnClick: false,
    //       className: `workout--${workout.type}`,
    //     })
    //   )
    //   .setPopupContent(`Workout`)
    //   .openPopup();

    // this._showWorkout();

    // inputCadence.value =
    //   inputDistance.value =
    //   inputDuration.value =
    //   inputElevation.value =
    //     ` `;
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coordinat)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === `running` ? `🏃` : `🚴‍♀️`
            } </span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;
    // console.log(html);

    if (workout.type === `running`) {
      html += `
    <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
    `;
    }

    if (workout.type === `cycling`) {
      html += `
    <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevator}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
    `;
    }
    form.insertAdjacentHTML('afterend', html);
    // console.log(html);
  }

  _toPupUps(e) {
    const workEv = e.target.closest(`.workout`);

    if (!workEv) return;

    const work = this.#workouts.find(wk => wk.id === workEv.dataset.id);
    console.log(work);
    console.log(work.coordinat);

    this.#map.setView(work.coordinat, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
}

const app = new App();

// navigator.geolocation.getCurrentPosition(
//   function (position) {
//     console.log(position);
//     const { latitude } = position.coords;
//     const { longitude } = position.coords;
//     console.log(latitude, longitude);
//   },
//   function () {}
// );

// let map;

// map = L.map('map').setView([51.505, -0.09], 13);

// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

// map.on(`click`, function (e) {
//   console.log(e.latlng);
// });

// let map, mapEvent;

// class App {
//   #map;
//   #mapEvent;
//   constructor() {
//     this._getPosition();
//     form.addEventListener(`submit`, this._newWorkout.bind(this));
//     inputType.addEventListener(`change`, this._toggleElevationField);
//   }
//   _getPosition() {
//     if (navigator.geolocation)
//       navigator.geolocation.getCurrentPosition(
//         this._loadMap.bind(this),
//         function () {
//           alert(`I can not get your position`);
//         }
//       );
//   }
//   _loadMap(position) {
//     const { latitude } = position.coords;
//     const { longitude } = position.coords;
//     const coords = [latitude, longitude];

//     this.#map = L.map('map').setView(coords, 10);

//     L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(this.#map);

//     this.#map.on(`click`, this._showForm.bind(this));
//   }

//   _showForm(mapE) {
//     form.classList.remove(`hidden`);
//     inputDistance.focus();
//     this.#mapEvent = mapE.latlng;
//   }

//   _toggleElevationField() {
//     inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
//     inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
//     inputDistance.focus();
//   }
//   _newWorkout(e) {
//     e.preventDefault();
//     inputDistance.value =
//       inputDuration.value =
//       inputCadence.value =
//       inputElevation.value =
//         ` `;
//     inputDistance.focus();
//     console.log(`Enter`);
//     L.marker(this.#mapEvent)
//       .addTo(this.#map)
//       .bindPopup(
//         L.popup({
//           maxWidth: 350,
//           minWidth: 50,
//           autoClose: false,
//           closeOnClick: false,
//           className: `running-popup`,
//         })
//       )
//       .setPopupContent(`Workout`)
//       .openPopup();
//   }
// }

// const app = new App();

// if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       const { latitude } = position.coords;
//       const { longitude } = position.coords;
//       const coords = [latitude, longitude];

//       map = L.map('map').setView(coords, 10);

//       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       map.on(`click`, function (mapE) {
//         console.log(mapE);

//         form.classList.remove(`hidden`);
//         inputDistance.focus();

//         mapEvent = mapE.latlng;
//       });
//     },
//     function () {
//       alert(`I can not get your position`);
//     }
//   );
