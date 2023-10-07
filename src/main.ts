import { ErrorMapper } from "utils/ErrorMapper";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// this functions spawns a creep
function spawnFred(variant: string) {
  const nameOfFred = `fred-${variant}`;
  const willFredLive = Game.spawns['noobspitter'].spawnCreep([WORK, CARRY, MOVE], nameOfFred, { dryRun: true });

  if(willFredLive === OK) {
    Game.spawns['noobspitter'].spawnCreep([WORK, CARRY, MOVE], nameOfFred);
  }
}

// this function makes a creep collect energy
function collectEnergy(creep: Creep) {
  const sources = creep.room.find(FIND_SOURCES);
  if(creep.harvest(sources[1]) === ERR_NOT_IN_RANGE) {
    creep.moveTo(sources[1]);
  }
  creep.harvest(sources[1]);
}

function checkEnergyFull(creep: Creep) {
  return creep.store.getFreeCapacity() <= 0;
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
  spawnFred(Game.time.toString());

  for(const name in Game.creeps) {

    const fred = Game.creeps[name];
    const room = fred.room;
    const controller = fred.room.controller;

    if (fred && !checkEnergyFull(fred)) {
      fred.say('hungry', true);
      collectEnergy(fred);
      return;
    }

    if (fred && checkEnergyFull(fred) && room && controller) {
      fred.moveTo(controller.pos);
      fred.transfer(controller, RESOURCE_ENERGY);
    }
  }

});
