// Import the Spinner component into this file and test
// that it renders what it should for the different props it can take.
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Spinner from './Spinner.js';

test("renders spinner when 'on' prop is true", () => {
  const { getByText } = render(<Spinner on={true} />);
  const spinnerElement = getByText('Please wait...');
  expect(spinnerElement).toBeInTheDocument();
});
test('does not render spinner when "on" prop is false', () => {
  const { container } = render(<Spinner on={false} />);
  const spinnerElement = container.querySelector("#spinner");
  expect(spinnerElement).toBeNull();
});
// test('sanity', () => {
//   expect(true).toBe(false)
// })
//   expect(true).toBe(true)