# Practical 7.1

## Experiment Title

Implement JavaScript Arrays, Objects, Array Methods, DOM Manipulation, Event Handling, and Dynamic Task Management by developing an Interactive To-Do List Application.

## Student Details

- **Name:** Vedant Nawghare
- **PRN:** 24070521047

## Software / Tools Required

- Visual Studio Code
- Google Chrome / Any Modern Web Browser
- HTML5
- CSS3
- JavaScript (ES6)

## Aim

To understand and implement JavaScript arrays, objects, array methods, DOM manipulation, event handling, dynamic element creation, task filtering, and task management through an interactive To-Do List application.

## Concepts Used

- JavaScript Arrays
- JavaScript Objects
- `push()`
- `filter()`
- `map()`
- `find()`
- `includes()`
- `forEach()`
- DOM Manipulation
- Event Handling
- `addEventListener()`
- `createElement()`
- `appendChild()`
- `textContent`
- `classList`
- Conditional Statements
- Template Literals
- Date Handling
- Search Functionality
- Dynamic Task Filtering

## Case Study

### Taskly — Clipboard To-Do Application

An interactive To-Do List application named **Taskly** is developed using HTML, CSS, and JavaScript. The application allows users to add, edit, delete, search, filter, and complete tasks.

Each task contains a task description, priority level, due date, and completion status. JavaScript arrays and objects are used to store task information, while DOM manipulation is used to display and update task cards dynamically.

## Features

- Add new tasks
- Select task priority
- Set task due date
- Normal, Important, and Urgent task categories
- Mark tasks as completed
- Edit existing tasks
- Delete tasks
- Search tasks by text
- Filter all tasks
- Filter important tasks
- Filter urgent tasks
- Filter completed tasks
- Clear all completed tasks
- Display total task count
- Display completed task count
- Display remaining task count
- Display task completion progress
- Detect overdue tasks
- Display empty task message
- Dynamic task card creation
- Responsive clipboard-style interface

## JavaScript Array Methods Used

| Method | Purpose |
|---|---|
| `push()` | Adds a new task object to the tasks array. |
| `filter()` | Filters tasks based on priority, completion status, and search text. |
| `map()` | Updates the completion status of a selected task. |
| `find()` | Finds a task using its unique ID before editing it. |
| `includes()` | Checks whether the entered priority is valid. |
| `forEach()` | Iterates through filtered tasks and creates task cards. |

## JavaScript Objects Used

Each task is stored as an object containing the following properties:

```javascript
{
    id: 1,
    text: "Complete JavaScript practical",
    priority: "important",
    dueDate: "",
    completed: false
}
````

|
Property

|

Purpose

|
| --- | --- |
|

`id`

|

Stores the unique ID of the task.

|
|

`text`

|

Stores the task description.

|
|

`priority`

|

Stores the priority of the task.

|
|

`dueDate`

|

Stores the task deadline.

|
|

`completed`

|

Stores whether the task is completed or not.

|

## DOM Manipulation Used

|
Method / Property

|

Purpose

|
| --- | --- |
|

`getElementById()`

|

Accesses HTML elements using their IDs.

|
|

`querySelectorAll()`

|

Selects all filter items.

|
|

`createElement()`

|

Creates task cards and their child elements dynamically.

|
|

`appendChild()`

|

Adds task elements to the task list.

|
|

`textContent`

|

Displays task text, labels, and statistics.

|
|

`innerHTML`

|

Clears the task list and displays the empty state.

|
|

`className`

|

Assigns CSS classes to dynamically created elements.

|
|

`classList`

|

Adds and removes active and completed classes.

|
|

`style.width`

|

Updates the progress bar width dynamically.

|
|

`setAttribute()`

|

Adds accessibility labels to task buttons.

|

## Event Handling Used

|
Event

|

Purpose

|
| --- | --- |
|

`click`

|

Adds, edits, deletes, completes, and clears tasks.

|
|

`keydown`

|

Adds a task when the Enter key is pressed.

|
|

`input`

|

Searches tasks in real time.

|
|

`addEventListener()`

|

Attaches event handlers to buttons, inputs, and filters.

|

## Task Filtering Logic

The application supports the following filters:

|
Filter

|

Purpose

|
| --- | --- |
|

All Tasks

|

Displays every task.

|
|

Important

|

Displays tasks marked as important.

|
|

Urgent

|

Displays urgent tasks.

|
|

Completed

|

Displays tasks that are completed.

|
|

Search

|

Displays tasks matching the entered search text.

|

## Statistics and Progress

The application dynamically calculates:

* Total number of tasks

* Number of completed tasks

* Number of remaining tasks

* Number of important tasks

* Number of urgent tasks

* Percentage of completed tasks

* Number of currently visible tasks

The progress percentage is calculated using:

JavaScript

```
(completed / total) * 100
```

## File Structure

```
Practical-07/
└── Practical-7.2/
    ├── index.html
    ├── script.js
    └── style.css
```

## Output

The output of the program is shown below:

Output

## Result

The Taskly To-Do List Application was successfully implemented using JavaScript arrays, objects, array methods, DOM manipulation, and event handling. The application allows users to manage tasks dynamically by adding, editing, deleting, searching, filtering, and completing tasks.

## Conclusion

This practical provided an understanding of JavaScript arrays, objects, array methods, DOM manipulation, and event handling. Methods such as `push()`, `filter()`, `map()`, `find()`, `includes()`, and `forEach()` were used to manage task data and create an interactive To-Do List application.
