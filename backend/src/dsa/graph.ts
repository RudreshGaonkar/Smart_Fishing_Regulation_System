interface Edge {
  to: number;
  distance: number;
}

export class ZoneGraph {
  private adjacencyList: Map<number, Edge[]> = new Map();

  addEdge(from: number, to: number, distance: number) {
    if (!this.adjacencyList.has(from)) this.adjacencyList.set(from, []);
    if (!this.adjacencyList.has(to)) this.adjacencyList.set(to, []);
    // Bidirectional edges to assure full graph traversal
    this.adjacencyList.get(from)!.push({ to, distance });
    this.adjacencyList.get(to)!.push({ to: from, distance });
  }

  // Dijkstra's algorithm to find the nearest safe zone
  findNearestSafeZone(startZoneId: number, safeZonesSet: Set<number>): { zoneId: number | null, distance: number } {
    const distances = new Map<number, number>();
    const pq = new PriorityQueue<{ id: number, dist: number }>((a, b) => a.dist < b.dist);
    
    distances.set(startZoneId, 0);
    pq.push({ id: startZoneId, dist: 0 });

    while (!pq.isEmpty()) {
      const current = pq.pop()!;

      if (safeZonesSet.has(current.id) && current.id !== startZoneId) {
        return { zoneId: current.id, distance: current.dist };
      }

      if (current.dist > (distances.get(current.id) ?? Infinity)) continue;

      const neighbors = this.adjacencyList.get(current.id) || [];
      for (const neighbor of neighbors) {
        const newDist = current.dist + neighbor.distance;
        if (newDist < (distances.get(neighbor.to) ?? Infinity)) {
          distances.set(neighbor.to, newDist);
          pq.push({ id: neighbor.to, dist: newDist });
        }
      }
    }

    return { zoneId: null, distance: Infinity };
  }
}

// Simple Min-PriorityQueue helper for Dijkstra
class PriorityQueue<T> {
  private heap: T[] = [];
  constructor(private compare: (a: T, b: T) => boolean) {}
  
  push(val: T) {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }
  
  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    if (this.heap.length === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return top;
  }
  
  isEmpty() { return this.heap.length === 0; }
  
  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parent])) {
        [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
        index = parent;
      } else break;
    }
  }
  
  private bubbleDown(index: number) {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      
      if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest])) smallest = left;
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest])) smallest = right;
      
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else break;
    }
  }
}
