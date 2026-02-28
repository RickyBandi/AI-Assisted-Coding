// ===============================
// SINGLY LINKED LIST IMPLEMENTATION
// ===============================

class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertAtStart(value) {
    const newNode = new Node(value);
    newNode.next = this.head;
    this.head = newNode;
  }

  insertAtEnd(value) {
    const newNode = new Node(value);

    if (!this.head) {
      this.head = newNode;
      return;
    }

    let temp = this.head;
    while (temp.next) {
      temp = temp.next;
    }
    temp.next = newNode;
  }

  insertAtPosition(value, position) {
    if (position === 0) {
      this.insertAtStart(value);
      return;
    }

    let temp = this.head;
    for (let i = 0; temp && i < position - 1; i++) {
      temp = temp.next;
    }

    if (!temp) return;

    const newNode = new Node(value);
    newNode.next = temp.next;
    temp.next = newNode;
  }

  deleteAtStart() {
    if (!this.head) return;
    this.head = this.head.next;
  }

  deleteAtEnd() {
    if (!this.head) return;
    if (!this.head.next) {
      this.head = null;
      return;
    }

    let temp = this.head;
    while (temp.next.next) {
      temp = temp.next;
    }
    temp.next = null;
  }

  deleteAtPosition(position) {
    if (position === 0) {
      this.deleteAtStart();
      return;
    }

    let temp = this.head;
    for (let i = 0; temp && i < position - 1; i++) {
      temp = temp.next;
    }

    if (!temp || !temp.next) return;

    temp.next = temp.next.next;
  }

  search(value) {
    let temp = this.head;
    let index = 0;
    while (temp) {
      if (temp.value == value) return index;
      temp = temp.next;
      index++;
    }
    return -1;
  }

  length() {
    let count = 0;
    let temp = this.head;
    while (temp) {
      count++;
      temp = temp.next;
    }
    return count;
  }
}

const list = new LinkedList();

// UI Functions

function render() {
  const container = document.getElementById("listContainer");
  container.innerHTML = "";

  let temp = list.head;

  while (temp) {
    const div = document.createElement("div");
    div.className = "node";
    div.innerText = temp.value;
    container.appendChild(div);
    temp = temp.next;
  }
}

function log(message) {
  const logDiv = document.getElementById("log");
  logDiv.innerHTML = message + "<br>" + logDiv.innerHTML;
}

function insertStart() {
  const value = document.getElementById("valueInput").value;
  list.insertAtStart(value);
  log("Inserted at Start: " + value);
  render();
}

function insertEnd() {
  const value = document.getElementById("valueInput").value;
  list.insertAtEnd(value);
  log("Inserted at End: " + value);
  render();
}

function insertAt() {
  const value = document.getElementById("valueInput").value;
  const pos = parseInt(document.getElementById("positionInput").value);
  list.insertAtPosition(value, pos);
  log("Inserted " + value + " at position " + pos);
  render();
}

function deleteStart() {
  list.deleteAtStart();
  log("Deleted at Start");
  render();
}

function deleteEnd() {
  list.deleteAtEnd();
  log("Deleted at End");
  render();
}

function deleteAt() {
  const pos = parseInt(document.getElementById("positionInput").value);
  list.deleteAtPosition(pos);
  log("Deleted at position " + pos);
  render();
}

function searchValue() {
  const value = document.getElementById("valueInput").value;
  const result = list.search(value);
  log(result !== -1 ? "Found at position " + result : "Not Found");
}

function showLength() {
  log("Length: " + list.length());
}