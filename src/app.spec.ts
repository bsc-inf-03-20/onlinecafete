import { readFileSync } from 'fs';
import { join } from 'path';

describe('Landing page', () => {
  it('renders the cafeteria API title', () => {
    const html = readFileSync(join(process.cwd(), 'public', 'index.html'), 'utf8');
    expect(html).toContain('<title>Online Cafeteria API</title>');
    expect(html).toContain('Build a cafeteria experience people actually want to use.');
  });
});
