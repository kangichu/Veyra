(() => {
  const picker = document.getElementById('demoExamples');
  if (!picker) return;
  // Curated examples illustrate the interface; this does not call a live search API.
  const examples = {
    apartment: {
      query: 'A three-bedroom apartment in Westlands under KES 18M. A balcony would be a plus.',
      type: 'Apartment', location: 'Westlands', bedrooms: '3 bedrooms', budget: 'Under KES 18M',
      listings: [
        {name:'Westlands apartment', details:'3 bedrooms · 2 bathrooms · Westlands · Balcony', price:'KES 16.8M', match:'FULL MATCH', reason:'Matches property type, location, bedrooms and budget, with the preferred balcony.'},
        {name:'Westlands apartment', details:'3 bedrooms · 3 bathrooms · Westlands · No balcony', price:'KES 17.5M', match:'WEAK MATCH', reason:'Meets the required property type, location, bedrooms and budget, but lacks the preferred balcony.'}
      ]
    },
    house: {
      query: 'A four-bedroom family home in Karen under KES 45M.',
      type: 'House', location: 'Karen', bedrooms: '4 bedrooms', budget: 'Under KES 45M',
      listings: [
        {name:'Karen family home', details:'4 bedrooms · 3 bathrooms · Karen', price:'KES 39M', match:'FULL MATCH', reason:'Matches property type, location, bedrooms and budget.'},
        {name:'Karen family home', details:'4 bedrooms · 4 bathrooms · Karen', price:'KES 48M', match:'RELAXED MATCH', reason:'Exceeds the requested KES 45M budget. Shown as a relaxed alternative, not a full match.'}
      ]
    }
  };
  const fields = {query:'demoQuery', type:'demoType', location:'demoLocation', bedrooms:'demoBedrooms', budget:'demoBudget'};
  picker.querySelectorAll('button[data-example]').forEach(button => {
    button.addEventListener('click', () => {
      const example = examples[button.dataset.example];
      if (!example) return;
      for (const [key, id] of Object.entries(fields)) document.getElementById(id).textContent = example[key];
      example.listings.forEach((listing, index) => {
        for (const key of ['name','details','price','reason','match']) document.getElementById('demo' + key[0].toUpperCase() + key.slice(1) + index).textContent = listing[key];
      });
      picker.querySelectorAll('button').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      document.getElementById('demoStatus').textContent = `${button.textContent} example selected. ${example.query} Illustrative outcomes: ${example.listings.map(listing => listing.match.toLowerCase()).join(" and ")}.`;
    });
  });
  picker.hidden = false;
})();
