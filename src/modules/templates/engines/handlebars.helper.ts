import Handlebars from 'handlebars';

// Basic helpers for templates
Handlebars.registerHelper('formatDate', (date: Date) => {
  return new Date(date).toLocaleDateString('ar-SA');
});

Handlebars.registerHelper('eq', (a, b) => a === b);

export default Handlebars;
