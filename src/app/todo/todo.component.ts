import { Component, ElementRef, ViewChild, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModel } from '../models/todo';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  title = "TODO'S" 

  todolist = signal<TodoModel[]>([]);

  filter = signal<FilterType>('active');

  todoListFiltered = computed(() => {
    const filter = this.filter();
    const todos = this.todolist();

    switch(filter){
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      case 'today':
        return todos.filter((todo) => todo.today)
      default:
        return todos;
    }
  })


  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  })

  constructor(){
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todolist()))
    })
  }

  ngOnInit(): void{
    const storage = localStorage.getItem('todos');
    if (storage) {
      this.todolist.set(JSON.parse(storage))
    }
  }


  changeFilter(filterString: FilterType) {
    this.filter.set(filterString)
  }

  addTodo(){
    const newTodoTitle = this.newTodo.value.trim()
    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todolist.update((prev_todos)=> [
        ...prev_todos,
        {id: Date.now(), title: newTodoTitle , completed: false, editing: false}
      ]);
      this.newTodo.reset()
    } else {
      this.newTodo.reset()
    }
  }

  toggleTodo(todoId: number , todoCompleted: boolean){
    const fechaActual = new Date();

    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1; // Los meses en JavaScript empiezan en 0, por lo que se suma 1
    const anio = fechaActual.getFullYear();

    // Formatea la fecha como una cadena de texto en el formato día-mes-año
    const fecha = `${dia}-${mes}-${anio}`;

    if(todoCompleted){
      this.todolist.update((prev_todos) => prev_todos.map((todo) => todo.id === todoId ? {...todo, completed: !todo.completed} : todo))
    } else {
      setTimeout(() => {
        this.todolist.update((prev_todos) => prev_todos.map((todo) => todo.id === todoId ? {...todo, completed: !todo.completed, today: false , date: fecha} : todo))
      }, 1000);
    }
  }
 
  
  removeTodo(todoId: number){
    this.todolist.update((prev_todos) => prev_todos.filter((todo) => todo.id !== todoId))
  }

  updateTodoEditingMode(todoId: number){
    this.todolist.update((prev_todos) => prev_todos.map((todo) => todo.id === todoId ? {...todo, editing: true} : {...todo,editing : false}))
  }

  saveTitleTodo(todoId: number , event: Event){
    const title = (event.target as HTMLInputElement).value;
    this.todolist.update((prev_todos) => prev_todos.map((todo) => todo.id === todoId ? {...todo, title: title,editing: false} : todo))
  }

  todayTodos(){
    this.title = 'TODAY'
    this.changeFilter('today')
  }

  logTodos(){
    this.title = 'LOGBOOK'
    this.changeFilter('completed')
  }

  goHome(){
    this.title = "TODO'S"
    this.changeFilter('active')
  }

  markToday(todoId: number) {
    this.todolist.update((prev_todos) => prev_todos.map((todo) => {
      if (todo.id === todoId && !todo.today) {
        return { ...todo, today: true };
      } else if (todo.today && todo.id === todoId) {
        return { ...todo, today: false };
      } else {
        return todo;
      }
    }));
  }
}
