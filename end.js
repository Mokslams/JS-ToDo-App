const maked = 'created';
const progress = 'progress';
const done = 'done';


const swiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: false,
    breakpoints: {
        // when window width is >= 540px
        540: {
          slidesPerView: 3,
          spaceBetween: 0
        }
      }
  });



class application {

    static listed = new Map();


    // static showDeleteConfirmModal(id) {
    //     // console.log(id);
    //     const modal = document.querySelector('.Delete');
    //     modal.style.display = 'block';
    //     modal.style.opacity = 1;
    //     modal.querySelector('.btn-primary').dataset.id = id;
    // }

    static create(text) {
        const created = this.listed.get(maked);
        created.list.set(created.getNum(), text);
        created.setListToStorage();
    }
    static move(id, from, to) {
        const app = this.listed.get(from).list.get(id);
        this.listed.get(from).list.delete(id);
        this.listed.get(from).setListToStorage();
        this.listed.get(to).list.set(id, app);
        this.listed.get(to).setListToStorage();
    }

    static delete(id, type) {
        this.listed.get(type).list.delete(id);
        this.listed.get(type).setListToStorage();
    }

    constructor(type) {
        this.type = type;
        this.constructor.listed.set(this.type, this);
        this.list = new Map(this.getListFromStorage());
    }

    getNum() {
        const min = 100000000;
        const max = 999999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    getListFromStorage() {
        let data = localStorage.getItem(this.type);
        if (null === data) {
            return [];
        }
        return JSON.parse(data);
    }

    setListToStorage() {
        const data = [...this.list];
        localStorage.setItem(this.type, JSON.stringify(data));
    }
}

class DomList {

    constructor() {
      
        this.createText = document.querySelector('input[name=create]');
        this.createButton = document.querySelector('button[name=create]');
        this.showButtons();
        this.runEvents();
        this.runCreators();
        this.stats();

    }

    runEvents() {
        this.createEvent();
        this.resizeWindow();
    }

    runCreators() {
        this.list(maked);
        this.list(progress);
        this.list(done);
    }

    showButtons() {
            this.buttons = 'buttons';
    }

    closeModal(cs) {
        cs.remove();
        document.querySelectorAll('button').forEach(b => {
            b.removeAttribute('disabled');
        });
    }

    list(type) {
        const place = document.querySelector('#' + type);
        while (place.firstChild) {
            place.removeChild(place.lastChild);
        }
        const data = application.listed.get(type).list;
        console.log(this.buttons);
        if ('buttons' === this.buttons) {
            for (const app of data) {
                const li = document.createElement('li');
                const text = document.createTextNode(app[1]);
                const id = document.createAttribute('data-id');
                const button = document.createElement('button');
                const deleteText = document.createTextNode('Delete');
                button.appendChild(deleteText);
                button.classList.add('Delete');
                id.value = app[0];
                li.setAttributeNode(id);
                li.appendChild(text);
                li.appendChild(button);
                place.appendChild(li);
                this.deleteEvent(app[0], type);
                if (maked === type) {
                    this.toProgressEvent(app[0]);
                }

                if (type === maked || type === progress) {
                    const moveButton = document.createElement('button');
                    let moveText;
                    
                    if (type === maked) {
                        moveText = document.createTextNode(`Move task`);
                    }
                    if (type === progress) {
                        moveText = document.createTextNode('Finish');
                    }
                    moveButton.appendChild(moveText);
                    moveButton.classList.add('move');
                    li.appendChild(moveButton);

                    li.appendChild(button);
                    place.appendChild(li);
                    this.deleteEvent(app[0], type);

                    if (maked === type) {
                        this.toProgressEventMobile(app[0]);
                    }
                    if (progress === type) {
                        this.DoneEventMobile(app[0]);
                    }
                }

            }
        }
    }

    confirmDelete(id, type) {
        document.querySelectorAll('div.confirm').forEach(b => {
            // console.log(type);
            // b.setAttribute('disabled', true);
            b.style.display = 'none';
        });
        const div = document.createElement('div');
        // div.classList.add('modal');
        const text = document.createTextNode('Are you sure?');
        const deleteButton = document.createElement('button');
        const cancelButton = document.createElement('button');
        const deleteText = document.createTextNode('Delete');
        const cancelText = document.createTextNode('Later');
        deleteButton.appendChild(deleteText);
        cancelButton.appendChild(cancelText);
        div.appendChild(text);
        div.appendChild(deleteButton);
        div.appendChild(cancelButton);
        cancelButton.classList.add('button-later');
        deleteButton.classList.add('button-delete');
        div.classList.add('confirm');
        document.body.appendChild(div);
        this.deleteConfirmEvent(id, type, deleteButton, div);
        this.cancelDeleteConfirmEvent(cancelButton, div);
    }


    stats() {
        const stats = document.querySelector('#stats');
        while (stats.firstChild) {
            stats.removeChild(stats.lastChild)
        }
        const typesList = new Map([
            [maked, 'Sukurta: '],
            [progress, 'Vykdoma: '],
            [done, 'Atlikta: ']]);
        for (const type of typesList) {
            const size = application.listed.get(type[0]).list.size;
            const statsText = document.createTextNode(type[1] + size);
            const statsElement = document.createElement('div');
            statsElement.appendChild(statsText);
            stats.appendChild(statsElement);

        }
    }

    createEvent() {
        this.createButton.addEventListener('click', () => {
            application.create(this.createText.value);
            this.createText.value = '';
            this.list(maked);
            this.stats();
        });
    }

    deleteEvent(id, type) {
        document.querySelector('[data-id="' + id + '"] button.Delete').addEventListener('click', () => {
            this.confirmDelete(id, type);
        })
    }

    deleteConfirmEvent(id, type, deleteButton, div) {
        deleteButton.addEventListener('click', () => {
            application.delete(id, type);
            this.list(type);
            this.stats();
            this.closeModal(div);
        })
    }

    cancelDeleteConfirmEvent(cancelButton, div) {
        cancelButton.addEventListener('click', () => {
            this.closeModal(div);
        })
    }

    toProgressEvent(id) {
        document.querySelector('[data-id="' + id + '"]').addEventListener('dblclick', () => {
            application.move(id, maked, progress);
            this.list(maked);
            this.list(progress);
            this.stats();
        });
    }

    toProgressEventMobile(id) {
        document.querySelector('[data-id="' + id + '"] button.move').addEventListener('click', () => {
            application.move(id, maked, progress);
            this.list(maked);
            this.list(progress);
            this.stats();
        });
    }

    DoneEvent(id) {
        document.querySelector('[data-id="' + id + '"]').addEventListener('dblclick', () => {
            application.move(id, progress, done);
            this.list(progress);
            this.list(done);
            this.stats();
        });
    }

    DoneEventMobile(id) {
        document.querySelector('[data-id="' + id + '"] button.move').addEventListener('click', () => {
            application.move(id, progress, done);
            this.list(progress);
            this.list(done);
            this.stats();
        });
    }

    resizeWindow() {
        window.addEventListener('resize', () => {
            this.showButtons();
        });
    }
//Imported
    // deleteButton() {
    //     this.element.querySelector('.modal')
    //         .addEventListener('click', () => this.constructor.showDeleteConfirmModal(this.id));
    //     //this.constructor == Animal Class
    // }
}


const x1 = new application(maked);
const x2 = new application(progress);
const x3 = new application(done);

const app = new DomList();


// console.log(l1.getNum());
// console.log(l1.getNum());
// console.log(l1.getNum());

