// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler
const fetch = require("node-fetch")


console.log("Welcome to Programiz!");
main()

async function f1() {
    console.log("start of f1")
     f2()
     console.log("end the f1 function");
}

async function f2() {
    //    for(var i =0; i<100000; i++) {
    //     console.log(i);
    // }

    const getPokemonNames = async () => {
        try {
            console.log("fetch starting ")
          const response = fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
          if (!response.ok) {
            throw new Error("Failed to fetch Pokémon names");
          }
          const data = response.json();
          const pokemonNames = data.results.map((pokemon) => pokemon.name);
          console.log(pokemonNames);

        } catch (error) {
          console.error("Error retrieving Pokémon names:", error);
        }
        console.log("fetch ending ")
      };
      
      getPokemonNames();
      
    console.log("end of f2 output")
}

function main() {
    
    
    
    f1();
}