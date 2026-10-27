// School system: port of the Java training (java/classes + java/app/app.java).
// Class names map to the originals: Member=Membro, Learner=Discente, Student=Aluno,
// Staff=Docente, Teacher=Professor, Coordinator=Coordenador, Director=Diretor, Subject=Disciplina.

class Member {
    #cpf;
    #name;
    #age;
    #email;

    constructor(cpf, name, age, email) {
        this.#cpf = cpf;
        this.#name = name;
        this.#age = age;
        this.#email = email;
    }

    get cpf() { return this.#cpf; }
    get name() { return this.#name; }
    get age() { return this.#age; }
    get email() { return this.#email; }
}

class Learner extends Member {}

class Student extends Learner {
    #grades;
    #attendance;
    #average = 0;
    #approved = false;
    #listeners = [];

    constructor(cpf, name, age, email, grades, attendance) {
        super(cpf, name, age, email);
        this.#grades = grades;
        this.#attendance = attendance;
        this.#calcAverage();
        this.#calcApproved();
    }

    // Same contract as the AlunoList interface: listeners get onStudentChange().
    addListener(listener) {
        if (!this.#listeners.includes(listener)) this.#listeners.push(listener);
    }

    #notify() {
        this.#listeners.forEach((listener) => listener.onStudentChange());
    }

    #calcAverage() {
        this.#average = this.#grades.reduce((total, grade) => total + grade, 0) / this.#grades.length;
        this.#notify();
    }

    #calcApproved() {
        this.#approved = this.#average >= 5 && this.#attendance >= 75;
        this.#notify();
    }

    get grades() { return [...this.#grades]; }
    get attendance() { return this.#attendance; }
    get average() { return this.#average; }
    get approved() { return this.#approved; }

    set grades(grades) {
        this.#grades = grades;
        this.#calcAverage();
        this.#calcApproved();
    }

    set attendance(value) {
        this.#attendance = value;
        this.#calcApproved();
    }
}

class Monitor extends Learner {
    static role = 'Monitor';
    #salary = 2000;
    #year;
    #scholarship;

    constructor(cpf, name, age, email, year, scholarship) {
        super(cpf, name, age, email);
        this.#year = year;
        this.#scholarship = scholarship;
    }

    get salary() { return this.#salary; }
    get detail() { return `Ano ${this.#year} · bolsa ${this.#scholarship}`; }
    raise() { return this.#salary * 1.05; }
    discount() { return this.#salary * 0.95; }
}

class Staff extends Member {
    static role = 'Docente';
    static salary = 0;
    static raiseRate = 1;
    static discountRate = 1;

    get salary() { return this.constructor.salary; }
    raise() { return this.salary * this.constructor.raiseRate; }
    discount() { return this.salary * this.constructor.discountRate; }
}

class Teacher extends Staff {
    static role = 'Professor';
    static salary = 7000;
    static raiseRate = 1.10;
    static discountRate = 0.85;
    #course;

    constructor(cpf, name, age, email, course) {
        super(cpf, name, age, email);
        this.#course = course;
    }

    get detail() { return this.#course; }
}

class Coordinator extends Staff {
    static role = 'Coordenador';
    static salary = 11000;
    static raiseRate = 1.15;
    static discountRate = 0.75;
    get detail() { return `${this.age} anos`; }
}

class Director extends Staff {
    static role = 'Diretor';
    static salary = 16000;
    static raiseRate = 1.20;
    static discountRate = 0.70;
    get detail() { return `${this.age} anos`; }
}

class Subject {
    #name;
    #students;
    #staff;
    #monitors;
    #approvalRate = 0;
    #onChange;

    constructor(name, students, staff, monitors, onChange) {
        this.#name = name;
        this.#students = students;
        this.#staff = staff;
        this.#monitors = monitors;
        this.#onChange = onChange;
        this.#students.forEach((student) => student.addListener(this));
        this.calculateApproval();
    }

    get name() { return this.#name; }
    get students() { return [...this.#students]; }
    get team() { return [...this.#staff, ...this.#monitors]; }
    get approvalRate() { return this.#approvalRate; }

    // ≥ 60% approved -> raise; < 50% -> discount; in between -> unchanged.
    get adjustment() {
        if (this.#approvalRate >= 60) return 'raise';
        if (this.#approvalRate < 50) return 'discount';
        return 'none';
    }

    addStudent(student, index = this.#students.length) {
        student.addListener(this);
        this.#students.splice(index, 0, student);
        this.calculateApproval();
    }

    // Returns the old position so the removal can be undone.
    removeStudent(student) {
        const index = this.#students.indexOf(student);
        this.#students.splice(index, 1);
        this.calculateApproval();
        return index;
    }

    calculateApproval() {
        const approved = this.#students.filter((student) => student.approved).length;
        this.#approvalRate = this.#students.length ? (approved / this.#students.length) * 100 : 0;
        if (this.#onChange) this.#onChange(this);
    }

    onStudentChange() {
        this.calculateApproval();
    }
}

(() => {
    const studentsBody = document.querySelector('[data-school-students]');
    const staffBody = document.querySelector('[data-school-staff]');
    const rateOutput = document.querySelector('[data-school-rate]');
    const rule = document.querySelector('[data-school-rule]');
    const form = document.querySelector('[data-school-form]');
    const newStudents = new WeakSet();

    // Formatters are created once: toLocaleString with options builds a new one per call.
    const MONEY_FORMAT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const DECIMAL_FORMAT = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    const money = (value) => MONEY_FORMAT.format(value);
    const decimal = (value) => DECIMAL_FORMAT.format(value);

    const cell = (text, modifier = '') => {
        const td = document.createElement('td');
        td.className = modifier ? `sheet__cell sheet__cell--${modifier}` : 'sheet__cell';
        td.textContent = text;
        return td;
    };

    const badge = (text, modifier) => {
        const td = cell('');
        const span = document.createElement('span');
        span.className = `badge badge--${modifier}`;
        span.textContent = text;
        td.append(span);
        return td;
    };

    let subject = null;
    const feedback = document.querySelector('[data-school-result]');

    // User control: removing a student can be undone from the message.
    const removeWithUndo = (current, student) => {
        const index = current.removeStudent(student);
        feedback.className = 'result result--success';
        feedback.textContent = `${student.name} removido(a) da turma.`;
        const undo = document.createElement('button');
        undo.className = 'result__action';
        undo.type = 'button';
        undo.textContent = 'Desfazer';
        undo.addEventListener('click', () => {
            current.addStudent(student, index);
            feedback.textContent = `${student.name} voltou para a turma.`;
        });
        feedback.append(' ', undo);
    };

    const render = (current) => {
        const rate = current.approvalRate;
        rateOutput.textContent = `${decimal(rate)}%`;

        const messages = {
            raise: ['success', 'Aumento: 60% ou mais da turma foi aprovada — toda a equipe recebe reajuste para cima.'],
            discount: ['error', 'Foram descontados: menos de 50% da turma foi aprovada.'],
            none: ['warning', 'Entre 50% e 60% de aprovação: salários sem alteração.'],
        };
        const [modifier, text] = messages[current.adjustment];
        rule.className = `result result--${modifier}`;
        rule.textContent = text;

        studentsBody.replaceChildren(...current.students.map((student) => {
            const tr = document.createElement('tr');
            tr.className = newStudents.has(student) ? 'sheet__row sheet__row--new' : 'sheet__row';
            const remove = document.createElement('button');
            remove.className = 'sheet__remove';
            remove.type = 'button';
            remove.textContent = '✕';
            remove.setAttribute('aria-label', `Remover ${student.name} da turma`);
            remove.addEventListener('click', () => removeWithUndo(current, student));
            const actions = cell('');
            actions.append(remove);
            const nameCell = cell(student.name);
            if (newStudents.has(student)) {
                nameCell.append(Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: ' (novo)' }));
            }
            tr.append(
                nameCell,
                cell(student.email),
                cell(student.grades.map(decimal).join(' · '), 'number'),
                cell(decimal(student.average), 'number'),
                cell(`${student.attendance}%`, 'number'),
                student.approved ? badge('Aprovado', 'success') : badge('Reprovado', 'danger'),
                actions,
            );
            return tr;
        }));

        staffBody.replaceChildren(...current.team.map((member) => {
            const tr = document.createElement('tr');
            tr.className = 'sheet__row';
            const adjusted = { raise: member.raise(), discount: member.discount(), none: member.salary }[current.adjustment];
            tr.append(
                cell(member.constructor.role),
                cell(member.name),
                cell(member.detail),
                cell(money(member.salary), 'number'),
                cell(money(adjusted), 'number'),
            );
            return tr;
        }));
    };

    // Same people as app.java (duplicated coordinators removed).
    const students = [
        new Student(123456789, 'Bi', 28, 'hotops@gmail.com', [3, 2], 10),
        new Student(987425511, 'Thai', 15, 'thai.f@gmail.com', [10, 10], 75),
        new Student(715486513, 'Euzébio', 16, 'zeze@gmail.com', [5, 1], 50),
        new Student(715486514, 'Claudinei', 17, 'meninoNey@gmail.com', [5, 1], 50),
    ];
    const staff = [
        new Teacher(1234567, 'Francis', 20, 'francisQuini@gmail.com', 'Matemática'),
        new Teacher(1234568, 'Maria-de-Lurdes', 55, 'maria.lurdes@gmail.com', 'Inglês'),
        new Teacher(1234569, 'Isaque', 30, 'isaque@gmail.com', 'Geografia'),
        new Coordinator(3461572, 'Christiane', 51, 'chrisflor@gmail.com'),
        new Coordinator(4478152, 'Marta', 47, 'martinha@gmail.com'),
        new Coordinator(3465197, 'Julia', 29, 'julinha@gmail.com'),
    ];
    const monitors = [
        new Monitor(3512469, 'jubileu', 37, 'jubinho@gmail.com', 2010, 30),
        new Monitor(7845946, 'Claudete', 45, 'cladetelindinha@gmail.com', 2018, 60),
        new Monitor(2541364, 'Clóvis', 33, 'clovinho@gmail.com', 2014, 80),
    ];

    subject = new Subject('porcentagem aprovada', students, staff, monitors, render);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const fields = form.elements;
        const student = new Student(
            Date.now(),
            fields.namedItem('studentName').value.trim(),
            Number(fields.namedItem('studentAge').value),
            fields.namedItem('studentEmail').value.trim(),
            [Number(fields.namedItem('grade1').value), Number(fields.namedItem('grade2').value)],
            Number(fields.namedItem('attendance').value),
        );
        newStudents.add(student);
        subject.addStudent(student);
        form.reset();
    });
})();
