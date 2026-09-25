(() => {
  const picker = document.getElementById('demoExamples');
  if (!picker) return;
  // Curated examples illustrate the interface; this does not call a live search API.
  const examples = {
    apartment: {
      query: 'A three-bedroom apartment in Westlands under KES 18M.',
      type: 'Apartment', location: 'Westlands', bedrooms: '3 bedrooms', budget: 'Under KES 18M',
      listings: [
        {name:'Westlands apartment', details:'3 bedrooms · 2 bathrooms · Westlands', price:'KES 16.8M', reason:'Matches the location and bedroom count, within the KES 18M budget.'},
        {name:'Westlands apartment', details:'3 bedrooms · 3 bathrooms · Westlands', price:'KES 17.5M', reason:'Another match for the same request, with an additional bathroom.'}
      ]
    },
    house: {
      query: 'A four-bedroom family home in Karen under KES 45M.',
      type: 'House', location: 'Karen', bedrooms: '4 bedrooms', budget: 'Under KES 45M',
      listings: [
        {name:'Karen family home', details:'4 bedrooms · 3 bathrooms · Karen', price:'KES 39M', reason:'Matches the location and bedroom count, within the KES 45M budget.'},
        {name:'Karen family home', details:'4 bedrooms · 4 bathrooms · Karen', price:'KES 42.5M', reason:'Another match for the same request, with an additional bathroom.'}
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
        for (const key of ['name','details','price','reason']) document.getElementById('demo' + key[0].toUpperCase() + key.slice(1) + index).textContent = listing[key];
      });
      picker.querySelectorAll('button').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      document.getElementById('demoStatus').textContent = `${button.textContent} example selected. ${example.query} Two illustrative matches shown.`;
    });
  });
  picker.hidden = false;
})();
