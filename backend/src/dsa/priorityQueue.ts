export interface EndangeredSpecies {
  species_id: number;
  name: string;
  risk_level: number;
  stock_percentage: number;
}

export class SpeciesPriorityQueue {
  private heap: EndangeredSpecies[] = [];

  // Higher priority: (1) Higher risk level -> (2) Lower stock percentage
  private compare(a: EndangeredSpecies, b: EndangeredSpecies): boolean {
    if (a.risk_level !== b.risk_level) {
      return a.risk_level > b.risk_level; // Max-Heap logic for ascending risk_level integers
    }
    return a.stock_percentage < b.stock_percentage; // Min-Heap logic for lower % meaning higher vulnerability
  }

  insert(species: EndangeredSpecies) {
    this.heap.push(species);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMostEndangered(): EndangeredSpecies | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();
    
    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return root;
  }

  peek(): EndangeredSpecies | undefined {
    return this.heap[0];
  }
  
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

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
      let highest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && this.compare(this.heap[left], this.heap[highest])) highest = left;
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[highest])) highest = right;

      if (highest !== index) {
         [this.heap[index], this.heap[highest]] = [this.heap[highest], this.heap[index]];
         index = highest;
      } else break;
    }
  }
}
