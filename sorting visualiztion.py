import matplotlib.pyplot as plt
import random


def visualize_sort(arr, swaps, title):
    plt.bar(range(len(arr)), arr, color='blue')
    plt.title(title)
    plt.pause(0.1)
    plt.clf()


def bubble_sort_visualize(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                visualize_sort(arr, (j, j + 1), f'Bubble Sort: Swapped {arr[j]} and {arr[j+1]}')


def quick_sort_visualize(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        visualize_sort(arr, (low, pi), f'Quick Sort: Pivot {arr[pi]}')
        quick_sort_visualize(arr, low, pi - 1)
        quick_sort_visualize(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
            visualize_sort(arr, (i, j), f'Quick Sort: Swapped {arr[i]} and {arr[j]}')
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1


def insertion_sort_visualize(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            visualize_sort(arr, (j, j + 1), f'Insertion Sort: Moved {arr[j]}')
            j -= 1
        arr[j + 1] = key
        visualize_sort(arr, (j + 1, i), f'Insertion Sort: Inserted {key}')


def heap_sort_visualize(arr):
    def heapify(arr, n, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        if left < n and arr[left] > arr[largest]:
            largest = left
        if right < n and arr[right] > arr[largest]:
            largest = right
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            visualize_sort(arr, (i, largest), f'Heap Sort: Swapped {arr[i]} and {arr[largest]}')
            heapify(arr, n, largest)

    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        visualize_sort(arr, (i, 0), f'Heap Sort: Swapped {arr[i]} and {arr[0]}')
        heapify(arr, i, 0)


def merge_sort_visualize(arr, l, r):
    if l < r:
        m = (l + r) // 2
        merge_sort_visualize(arr, l, m)
        merge_sort_visualize(arr, m + 1, r)
        merge(arr, l, m, r)
        visualize_sort(arr, (l, r), f'Merge Sort: Merged {l}-{r}')

def merge(arr, l, m, r):
    n1 = m - l + 1
    n2 = r - m
    L = arr[l:m + 1]
    R = arr[m + 1:r + 1]
    i = j = 0
    k = l
    while i < n1 and j < n2:
        if L[i] <= R[j]:
            arr[k] = L[i]
            i += 1
        else:
            arr[k] = R[j]
            j += 1
        k += 1
    while i < n1:
        arr[k] = L[i]
        i += 1
        k += 1
    while j < n2:
        arr[k] = R[j]
        j += 1
        k += 1


n = 50  
array = random.sample(range(1, n + 1), n)

plt.ion()  
algorithms = {
    'Bubble Sort': bubble_sort_visualize,
    'Quick Sort': lambda arr: quick_sort_visualize(arr, 0, len(arr) - 1),
    'Insertion Sort': insertion_sort_visualize,
    'Heap Sort': heap_sort_visualize,
    'Merge Sort': lambda arr: merge_sort_visualize(arr, 0, len(arr) - 1)
}


for name, sort_function in algorithms.items():
    print(f"Visualizing {name}...")
    sort_function(array.copy())

plt.show()
