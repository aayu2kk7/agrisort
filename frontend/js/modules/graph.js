export const GraphModule = {
    // Nodes with coordinates for visualization (Mock Road Network around Delhi)
    nodeCoords: {
        '0': { lat: 28.7041, lng: 77.1025 }, // User (Delhi)
        '1': { lat: 28.7100, lng: 77.1100 },
        '2': { lat: 28.7000, lng: 77.0900 },
        '3': { lat: 28.7200, lng: 77.1200 },
        '4': { lat: 28.7150, lng: 77.1050 },
        '5': { lat: 28.6900, lng: 77.0800 },
        '6': { lat: 28.7300, lng: 77.1300 },
        '7': { lat: 28.7250, lng: 77.0950 },
        '11': { lat: 28.7500, lng: 77.1500 }, // Facility 1 (AgriStore North)
        '12': { lat: 28.6500, lng: 77.0500 }  // Facility 2 (CoolFreeze)
    },

    init() {
        console.log('Initializing Graph Module (Dijkstra)...');
        this.buildGraph();
    },

    buildGraph() {
        // Adjacency list with weights (km)
        this.graph = {
            '0': { '1': 2, '2': 3 },
            '1': { '0': 2, '3': 2, '4': 1 },
            '2': { '0': 3, '4': 2, '5': 2 },
            '3': { '1': 2, '6': 3 },
            '4': { '1': 1, '2': 2, '6': 2, '7': 2 },
            '5': { '2': 2, '7': 3 },
            '6': { '3': 3, '4': 2, '11': 2 },
            '7': { '4': 2, '5': 3, '12': 4 },
            '11': { '6': 2 },
            '12': { '7': 4 }
        };
    },

    // Dijkstra's Algorithm
    // Returns { distance, path }
    getShortestPath(startNode, endNode) {
        const distances = {};
        const previous = {}; // To reconstruct path
        const visited = new Set();
        const pq = new PriorityQueue();

        // Initialize
        for (let node in this.graph) {
            distances[node] = Infinity;
            previous[node] = null;
        }
        distances[startNode] = 0;

        pq.enqueue(startNode, 0);

        while (!pq.isEmpty()) {
            const { element: currentNode, priority: currentDist } = pq.dequeue();

            if (visited.has(currentNode)) continue;
            visited.add(currentNode);

            if (currentNode === endNode) break; // Found target

            const neighbors = this.graph[currentNode];
            if (!neighbors) continue;

            for (let neighbor in neighbors) {
                const weight = neighbors[neighbor];
                const newDist = currentDist + weight;

                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    previous[neighbor] = currentNode;
                    pq.enqueue(neighbor, newDist);
                }
            }
        }

        // Reconstruct path
        const path = [];
        let curr = endNode;
        if (distances[endNode] !== Infinity) {
            while (curr !== null) {
                path.unshift(this.nodeCoords[curr] || { lat: 0, lng: 0 }); // Add coords
                curr = previous[curr];
            }
        }

        return {
            distance: distances[endNode] === Infinity ? -1 : distances[endNode],
            path: path
        };
    },

    calculateRoadDistance(facilityId) {
        // Map facility ID to graph node
        const targetNode = (facilityId % 2 !== 0) ? '11' : '12';
        return this.getShortestPath('0', targetNode);
    }
};

// Simple Priority Queue Implementation
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        const qElement = { element, priority };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                this.items.splice(i, 0, qElement);
                added = true;
                break;
            }
        }
        if (!added) {
            this.items.push(qElement);
        }
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}
