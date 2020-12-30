'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(cords, distance, duration) {
    this.cords = cords;
    this.distance = distance;
    this.duration = duration;
  }

  discriptiongen() {
    // prettier-ignore
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(cords, distance, duration, elevationGain) {
    super(cords, distance, duration);
    this.elevationGain = elevationGain;

    this.calcSpeed();
    this.discriptiongen();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(cords, distance, duration, cadence) {
    super(cords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this.discriptiongen();
  }
  calcPace() {
    this.Pace = this.duration / this.distance;
    return this.Pace;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this.__newWorkout.bind(this));
    inputType.addEventListener('change', this.__toggleElevationField);

    containerWorkouts.addEventListener('click', this.__movetoPopup.bind(this));
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this.__loadMap.bind(this),
      function () {
        alert('Could not get current position');
      }
    );
  }

  __loadMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log(latitude, longitude);

    const cords = [latitude, longitude];

    this.#map = L.map('map').setView(cords, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this.__showForm.bind(this));
  }

  __showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  __hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(function () {
      form.style.display = 'grid';
    }, 1000);
  }

  __toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  __newWorkout(e) {
    // get data from form
    // console.log('das');

    const isValid = function (arr) {
      for (let i = 0; i < arr.length; i++) {
        // console.log(Number.isInteger(arr[i]));
        if (!Number.isInteger(arr[i]) || arr[i] < 0) {
          return false;
        }
      }
      return true;
    };
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const coord = this.#mapEvent.latlng;
    const lat = coord.lat;
    const lng = coord.lng;
    let cords = [lat, lng];
    let workout;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // console.log('s');
      if (!isValid([distance, duration, cadence])) {
        // console.log('soz');
        return alert('Enter Positive Number');
      }

      workout = new Running(cords, distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      console.log('s');
      // debugger;
      if (!isValid([distance, duration, elevationGain])) {
        // console.log('soz');
        return alert('Enter Positive Number');
      }

      workout = new Cycling(cords, distance, duration, elevationGain);
    }

    this.#workouts.push(workout);
    console.log(workout);

    this.__renderWorkout(workout);

    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      ' ';
    e.preventDefault();
    this.renderMarker(workout);
    this.__hideForm();
  }

  renderMarker(workout) {
    L.marker(workout.cords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 150,
          minWidth: 100,
          // autoClose: false,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        ` ${workout.type === 'running' ? '🏃‍♂' : '🚴‍♀️'} ${workout.discription}`
      )

      .openPopup();
  }

  __renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.discription}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type == 'running' ? '🏃‍♂' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;
    if (workout.type === 'running') {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.Pace.toFixed(1)}</span>
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
    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }
  __movetoPopup(e) {
    const workoutel = e.target.closest('.workout');
    if (!workoutel) return;

    const workout = this.#workouts.find(
      work => work.id === workoutel.dataset.id
    );

    console.log(workout);

    this.#map.setView(workout.cords, 15, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const app = new App();
