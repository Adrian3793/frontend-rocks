	import { useState, useEffect } from "react";
import { PokeAPI } from "./api";


type Props = {
  id: number;
  image: string;
  name: string;
  types: string[];
};

function Card(props: Props) {
  const primaryType = props.types[0];
  const headerGradient = getHeaderGradient(primaryType);

  return (
    <article className="card">
      {/* Header */}
      <div className={`card-header ${headerGradient}`}>
        <h2 className="card-title text-white drop-shadow">{props.name}</h2>
        <p className="text-xs text-white/90 mt-1">
          NO.{String(props.id).padStart(3, "0")} • {primaryType.charAt(0).toUpperCase() + primaryType.slice(1)}
        </p>
      </div>

      {/* Image */}
      <img
        src={props.image}
        alt={props.name}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />

      {/* Content */}
      <div className="card-content">
        <p className="card-subtitle">{props.types.length > 0 ? props.types[0].charAt(0).toUpperCase() + props.types[0].slice(1) : "Normal"} Type</p>
        <div className="type-badges">
          {props.types.map((type) => (
            <span
              key={type}
              className={`type-badge ${getTypeColor(type)}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function Root() {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number>(0);

  const loadPage = async (start: number) => {
    try {
      const { cards: newCards, total: count } = await fetchData(start);
      setCards((prev) => [...prev, ...newCards]);
      setTotal(count);
    } catch (e: any) {
      setError(e.message || "Failed to fetch pokemons");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadPage(0);
      setLoading(false);
    })();
  }, []);

  const handleLoadMore = async () => {
    setLoading(true);
    const nextOffset = offset + 20;
    await loadPage(nextOffset);
    setOffset(nextOffset);
    setLoading(false);
  };

  if (loading && cards.length === 0) {
    return <div className="app-container text-center py-8"><p className="text-lg text-gray-700">Caricamento...</p></div>;
  }
  if (error) {
    return <div className="app-container text-center py-8"><p className="text-lg text-red-600">Errore: {error}</p></div>;
  }

  return (
    <div className="app-container">
      <div className="cards-grid">
        {cards.map((c) => (
          <Card key={c.id} id={c.id} image={c.image} name={c.name} types={c.types} />
        ))}
      </div>
      {cards.length < total && (
        <div className="flex justify-center mt-8 w-full">
          <button
            className="button button-primary"
            onClick={handleLoadMore}
            disabled={loading}
            aria-label={loading ? "Caricamento..." : "Carica altri Pokémon"}
          >
            {loading ? "Caricamento..." : "Carica altri"}
          </button>
        </div>
      )}
    </div>
  );
}

function getHeaderGradient(type: string): string {
  const gradients: { [key: string]: string } = {
    fire: "bg-gradient-to-b from-red-500 to-orange-400",
    water: "bg-gradient-to-b from-blue-500 to-cyan-400",
    grass: "bg-gradient-to-b from-green-500 to-lime-400",
    electric: "bg-gradient-to-b from-yellow-400 to-yellow-200",
    psychic: "bg-gradient-to-b from-pink-500 to-purple-400",
    ice: "bg-gradient-to-b from-cyan-400 to-blue-300",
    dragon: "bg-gradient-to-b from-purple-700 to-indigo-500",
    dark: "bg-gradient-to-b from-gray-700 to-gray-500",
    fairy: "bg-gradient-to-b from-pink-300 to-pink-100",
    normal: "bg-gradient-to-b from-gray-400 to-gray-200",
    fighting: "bg-gradient-to-b from-red-700 to-red-500",
    flying: "bg-gradient-to-b from-indigo-400 to-blue-300",
    poison: "bg-gradient-to-b from-purple-500 to-purple-300",
    ground: "bg-gradient-to-b from-yellow-600 to-yellow-400",
    rock: "bg-gradient-to-b from-yellow-800 to-yellow-600",
    bug: "bg-gradient-to-b from-green-700 to-green-500",
    ghost: "bg-gradient-to-b from-indigo-700 to-indigo-500",
    steel: "bg-gradient-to-b from-gray-500 to-gray-300",
  };
  return gradients[type] || "bg-gradient-to-b from-gray-200 to-gray-100";
}

function getTypeColor(type: string): string {
  return typeColors[type];
}

const typeColors: { [key: string]: string } = {
  fire: "bg-red-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-400",
  psychic: "bg-pink-500",
  ice: "bg-cyan-400",
  dragon: "bg-purple-700",
  dark: "bg-gray-700",
  fairy: "bg-pink-300",
  normal: "bg-gray-400",
  fighting: "bg-red-700",
  flying: "bg-indigo-400",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  rock: "bg-yellow-800",
  bug: "bg-green-700",
  ghost: "bg-indigo-700",
  steel: "bg-gray-500",
};

interface PokemonCard {
  id: number;
  image: string;
  name: string;
  types: string[];
}

async function fetchData(offset: number): Promise<{ cards: PokemonCard[]; total: number }> {
  // retrieve a page of pokemons along with overall count
  const pageSize = 20;
  const list = await PokeAPI.listPokemons(offset, pageSize);
  const pokemons = await Promise.all(
    list.results.map(async (item: { name: string; url: string }) => {
      const pokemon = await PokeAPI.getPokemonByName(item.name);
      return pokemon;
    }),
  );

  const cards = pokemons.map((item) => ({
    id: item.id,
    image: item.sprites.other?.["official-artwork"].front_default ?? "",
    name: item.name,
    types: item.types.map((type) => type.type.name),
  }));

  return { cards, total: list.count };
}
