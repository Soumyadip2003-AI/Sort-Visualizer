// src/utils/sortingAlgorithms.js

export function* bubbleSort(array) {
  let arr = [...array];
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'compare', indices: [j, j + 1] };
      if (arr[j] > arr[j + 1]) {
        yield { type: 'swap', indices: [j, j + 1] };
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
    yield { type: 'sorted', indices: [n - i - 1] };
  }
  yield { type: 'sorted', indices: [0] };
}

export function* selectionSort(array) {
  let arr = [...array];
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', indices: [minIdx, j] };
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      yield { type: 'swap', indices: [i, minIdx] };
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }
    yield { type: 'sorted', indices: [i] };
  }
  yield { type: 'sorted', indices: [n - 1] };
}

export function* insertionSort(array) {
  let arr = [...array];
  let n = arr.length;
  yield { type: 'sorted', indices: [0] };
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    yield { type: 'compare', indices: [j, i] };
    while (j >= 0 && arr[j] > key) {
      yield { type: 'compare', indices: [j, j + 1] };
      yield { type: 'overwrite', indices: [j + 1], value: arr[j] };
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    yield { type: 'overwrite', indices: [j + 1], value: key };
    arr[j + 1] = key;
    
    // In insertion sort, the left side grows sorted
    for(let k=0; k<=i; k++) {
      yield { type: 'sorted', indices: [k] };
    }
  }
}

export function* mergeSort(array) {
  let arr = [...array];
  yield* mergeSortHelper(arr, 0, arr.length - 1);
  for(let i=0; i<arr.length; i++) yield { type: 'sorted', indices: [i] };
}

function* mergeSortHelper(arr, left, right) {
  if (left >= right) return;
  const mid = Math.floor((left + right) / 2);
  yield* mergeSortHelper(arr, left, mid);
  yield* mergeSortHelper(arr, mid + 1, right);
  yield* merge(arr, left, mid, right);
}

function* merge(arr, left, mid, right) {
  let temp = [];
  let i = left, j = mid + 1;
  while (i <= mid && j <= right) {
    yield { type: 'compare', indices: [i, j] };
    if (arr[i] <= arr[j]) {
      temp.push(arr[i++]);
    } else {
      temp.push(arr[j++]);
    }
  }
  while (i <= mid) {
    temp.push(arr[i++]);
  }
  while (j <= right) {
    temp.push(arr[j++]);
  }
  for (let k = left; k <= right; k++) {
    yield { type: 'overwrite', indices: [k], value: temp[k - left] };
    arr[k] = temp[k - left];
  }
}

export function* quickSort(array) {
  let arr = [...array];
  yield* quickSortHelper(arr, 0, arr.length - 1);
  for(let i=0; i<arr.length; i++) yield { type: 'sorted', indices: [i] };
}

function* quickSortHelper(arr, low, high) {
  if (low < high) {
    const pi = yield* partition(arr, low, high);
    yield { type: 'sorted', indices: [pi] };
    yield* quickSortHelper(arr, low, pi - 1);
    yield* quickSortHelper(arr, pi + 1, high);
  } else if (low === high) {
    yield { type: 'sorted', indices: [low] };
  }
}

function* partition(arr, low, high) {
  let pivot = arr[high];
  yield { type: 'pivot', indices: [high] };
  let i = low - 1;
  for (let j = low; j < high; j++) {
    yield { type: 'compare', indices: [j, high] };
    if (arr[j] < pivot) {
      i++;
      yield { type: 'swap', indices: [i, j] };
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  yield { type: 'swap', indices: [i + 1, high] };
  let temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  return i + 1;
}

export function* heapSort(array) {
  let arr = [...array];
  let n = arr.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(arr, n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    yield { type: 'swap', indices: [0, i] };
    let temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;
    yield { type: 'sorted', indices: [i] };
    yield* heapify(arr, i, 0);
  }
  yield { type: 'sorted', indices: [0] };
}

function* heapify(arr, n, i) {
  let largest = i;
  let l = 2 * i + 1;
  let r = 2 * i + 2;

  if (l < n) {
    yield { type: 'compare', indices: [l, largest] };
    if (arr[l] > arr[largest]) {
      largest = l;
    }
  }

  if (r < n) {
    yield { type: 'compare', indices: [r, largest] };
    if (arr[r] > arr[largest]) {
      largest = r;
    }
  }

  if (largest !== i) {
    yield { type: 'swap', indices: [i, largest] };
    let temp = arr[i];
    arr[i] = arr[largest];
    arr[largest] = temp;
    yield* heapify(arr, n, largest);
  }
}
