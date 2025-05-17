import axios from 'axios';

const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      characters(sort: FAVOURITES_DESC) {
        id
        name { full native }
        gender
        age
        image { large }
        description
        favourites
        media(perPage: 3) {
          nodes {
            title { romaji }
            type
            siteUrl
          }
        }
      }
    }
  }
`;

export async function fetchTopFemaleCharacters(limit = 100) {
  const results = [];
  let page = 1;

  while (results.length < limit && page <= 10) {
    const res = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { page, perPage: 25 }
    });

    const characters = res.data.data.Page.characters;

    const femaleCharacters = characters.filter(c => c.gender === 'Female');

    femaleCharacters.forEach(c => {
      if (results.length < limit) {
        const mainMedia = c.media?.nodes?.[0];

        results.push({
          anilistId: c.id,
          name: c.name.full,
          nativeName: c.name.native,
          gender: c.gender,
          age: c.age || null,
          image: c.image.large,
          description: c.description,
          favourites: c.favourites,
          mainWork: c.media?.nodes?.[0]
          ? {
              title: c.media.nodes[0].title.romaji,
              type: c.media.nodes[0].type,
              url: c.media.nodes[0].siteUrl || null
            }
          : null
        });
      }
    });

    page++;
  }

  return results;
}
