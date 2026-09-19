import { render, screen } from '@testing-library/react-native';

import { Avatar, initialsFor } from '@/components/avatar';

describe('initialsFor', () => {
  it('uses the first and last word for a full name', () => {
    expect(initialsFor('Dana Osei')).toBe('DO');
  });

  it('uses a single initial for a one-word name', () => {
    expect(initialsFor('Cher')).toBe('C');
  });

  it('falls back to a placeholder for an empty name', () => {
    expect(initialsFor('   ')).toBe('?');
  });
});

describe('Avatar (photo paths removed)', () => {
  it('renders initials as text, not a photo', async () => {
    await render(<Avatar name="Dana Osei" seed="abc" size={72} />);
    expect(screen.getByText('DO')).toBeTruthy();
  });

  it('is deterministic: the same seed always renders the same output', async () => {
    const first = (await render(<Avatar name="Dana Osei" seed="fixed-id" size={72} />)).toJSON();
    const second = (await render(<Avatar name="Dana Osei" seed="fixed-id" size={72} />)).toJSON();
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});
