export const buildingFactory = {
    'residential': () => {
        return {
            type: 'residential',
            buildingType: Math.floor(2 * Math.random()) + 1, // 1 or 2 for different building types
            style: Math.floor(3 * Math.random()) + 1,
            height: 1 + Math.floor(2 * Math.random()), // Height 1-3
            width: 1,
            depth: 1,
            updated: true,
            update: function() {
                if(Math.random() < 0.01){
                    if(this.height < 5){
                        this.height += 1;
                        this.updated = true;
                    }
                }
            }
        }
    },
    'commercial': () => {
        return {
            type: 'commercial',
            buildingType: Math.floor(2 * Math.random()) + 1, // 1 or 2 for different building types
            style: Math.floor(3 * Math.random()) + 1,
            height: 2 + Math.floor(3 * Math.random()), // Height 2-5 (taller than residential)
            width: 1,
            depth: 1,
            updated: true,
            update: function() {
                if(Math.random() < 0.01){
                    if(this.height < 8){
                        this.height += 1;
                        this.updated = true;
                    }
                }
            }
        }
    },
    'industrial': () => {
        return {
            type: 'industrial',
            buildingType: Math.floor(2 * Math.random()) + 1, // 1 or 2 for different building types
            style: Math.floor(3 * Math.random()) + 1,
            height: 1 + Math.floor(2 * Math.random()), // Height 1-3
            width: 1.5, // Wider than other buildings
            depth: 1.5, // Deeper than other buildings
            updated: true,
            update: function() {
                if(Math.random() < 0.01){
                    if(this.height < 6){
                        this.height += 1;
                        this.updated = true;
                    }
                }
            }
        }
    },
    'road': () => {
        return {
            type: 'road',
            height: 0.05, // Very thin for roads
            width: 1,
            length: 1,
            updated: true,
            update: function() {
                this.updated = false;
            }
        }
    }
}