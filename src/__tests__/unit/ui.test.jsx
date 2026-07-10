import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Avatar, AvatarStack, Person, Badge, StatusBadge, Priority, Progress,
  Btn, Card, Stat, Seg, Tabs, Search, Select, EmptyState, PageHead,
} from '../../ui';

// ── Avatar ────────────────────────────────────────────────────────────────────
describe('Avatar', () => {
  it('renders initials from employee ID E-101', () => {
    render(<Avatar id="E-101" />);
    expect(screen.getByText('DW')).toBeInTheDocument();
  });

  it('renders initials from name prop when no ID given', () => {
    render(<Avatar name="John Smith" />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('renders custom initials override', () => {
    render(<Avatar initials="XY" />);
    expect(screen.getByText('XY')).toBeInTheDocument();
  });

  it('applies size as width and height style', () => {
    const { container } = render(<Avatar id="E-101" size={48} />);
    const el = container.firstChild;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });

  it('has class avatar', () => {
    const { container } = render(<Avatar id="E-101" />);
    expect(container.firstChild).toHaveClass('avatar');
  });
});

// ── AvatarStack ───────────────────────────────────────────────────────────────
describe('AvatarStack', () => {
  it('renders all avatars when within max', () => {
    render(<AvatarStack ids={['E-101','E-102','E-103']} max={4} />);
    expect(screen.getByText('DW')).toBeInTheDocument();
    expect(screen.getByText('ML')).toBeInTheDocument();
    expect(screen.getByText('PR')).toBeInTheDocument();
  });

  it('shows +N indicator for extras beyond max', () => {
    render(<AvatarStack ids={['E-101','E-102','E-103','E-104','E-105']} max={3} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders nothing for empty ids', () => {
    const { container } = render(<AvatarStack ids={[]} />);
    expect(container.querySelector('.avatar-stack')).toBeInTheDocument();
    expect(container.querySelectorAll('.avatar')).toHaveLength(0);
  });
});

// ── Person ────────────────────────────────────────────────────────────────────
describe('Person', () => {
  it('renders employee name for valid ID', () => {
    render(<Person id="E-101" />);
    expect(screen.getByText('Dana Whitfield')).toBeInTheDocument();
  });

  it('renders employee title for valid ID', () => {
    render(<Person id="E-101" />);
    expect(screen.getByText('VP Engineering')).toBeInTheDocument();
  });

  it('renders custom sub text when provided', () => {
    render(<Person id="E-101" sub="Team Lead" />);
    expect(screen.getByText('Team Lead')).toBeInTheDocument();
  });

  it('renders dash for invalid ID', () => {
    render(<Person id="E-999" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

// ── Badge ─────────────────────────────────────────────────────────────────────
describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies badge-green class for tone=green', () => {
    const { container } = render(<Badge tone="green">Active</Badge>);
    expect(container.firstChild).toHaveClass('badge-green');
  });

  it('applies badge-gray class for default tone', () => {
    const { container } = render(<Badge>Draft</Badge>);
    expect(container.firstChild).toHaveClass('badge-gray');
  });

  it('applies badge-amber class for tone=amber', () => {
    const { container } = render(<Badge tone="amber">Pending</Badge>);
    expect(container.firstChild).toHaveClass('badge-amber');
  });

  it('applies badge-red class for tone=red', () => {
    const { container } = render(<Badge tone="red">Overdue</Badge>);
    expect(container.firstChild).toHaveClass('badge-red');
  });

  it('renders dot element when dot prop is true', () => {
    const { container } = render(<Badge dot>Status</Badge>);
    expect(container.querySelector('.bd-dot')).toBeInTheDocument();
  });

  it('does not render dot when dot prop is false', () => {
    const { container } = render(<Badge>Status</Badge>);
    expect(container.querySelector('.bd-dot')).not.toBeInTheDocument();
  });
});

// ── StatusBadge ───────────────────────────────────────────────────────────────
describe('StatusBadge', () => {
  it.each([
    ['On track', 'badge-green'],
    ['At risk', 'badge-amber'],
    ['Delayed', 'badge-red'],
    ['Completed', 'badge-teal'],
    ['Planning', 'badge-blue'],
    ['Done', 'badge-green'],
    ['In progress', 'badge-blue'],
    ['In review', 'badge-violet'],
    ['Todo', 'badge-gray'],
    ['Blocked', 'badge-red'],
    ['Active', 'badge-green'],
    ['On leave', 'badge-amber'],
    ['Paid', 'badge-green'],
    ['Pending', 'badge-amber'],
    ['Overdue', 'badge-red'],
  ])('"%s" maps to %s', (value, cls) => {
    const { container } = render(<StatusBadge value={value} />);
    expect(container.firstChild).toHaveClass(cls);
  });

  it('renders the status text', () => {
    render(<StatusBadge value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

// ── Priority ──────────────────────────────────────────────────────────────────
describe('Priority', () => {
  it.each(['Urgent','High','Medium','Low'])('renders %s priority text', (value) => {
    render(<Priority value={value} />);
    expect(screen.getByText(value)).toBeInTheDocument();
  });
});

// ── Progress ──────────────────────────────────────────────────────────────────
describe('Progress', () => {
  it('renders with correct width percentage', () => {
    const { container } = render(<Progress value={75} />);
    const bar = container.querySelector('.progress > span');
    expect(bar.style.width).toBe('75%');
  });

  it('has class progress', () => {
    const { container } = render(<Progress value={50} />);
    expect(container.firstChild).toHaveClass('progress');
  });

  it('applies thin class when thin prop given', () => {
    const { container } = render(<Progress value={50} thin />);
    expect(container.firstChild).toHaveClass('thin');
  });

  it('applies custom color when provided', () => {
    const { container } = render(<Progress value={50} color="#ff0000" />);
    const bar = container.querySelector('.progress > span');
    expect(bar.style.background).toBe('rgb(255, 0, 0)');
  });
});

// ── Btn ───────────────────────────────────────────────────────────────────────
describe('Btn', () => {
  it('renders children text', () => {
    render(<Btn>Click me</Btn>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handler = vi.fn();
    render(<Btn onClick={handler}>Click</Btn>);
    await userEvent.click(screen.getByText('Click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('applies btn-primary class for variant=primary', () => {
    const { container } = render(<Btn variant="primary">Save</Btn>);
    expect(container.firstChild).toHaveClass('btn-primary');
  });

  it('applies btn-ghost class for variant=ghost (default)', () => {
    const { container } = render(<Btn>Ghost</Btn>);
    expect(container.firstChild).toHaveClass('btn-ghost');
  });

  it('applies btn-sm class when sm prop given', () => {
    const { container } = render(<Btn sm>Small</Btn>);
    expect(container.firstChild).toHaveClass('btn-sm');
  });

  it('renders as button element', () => {
    const { container } = render(<Btn>Button</Btn>);
    expect(container.firstChild.tagName).toBe('BUTTON');
  });
});

// ── Card ──────────────────────────────────────────────────────────────────────
describe('Card', () => {
  it('renders children', () => {
    render(<Card><span>Card content</span></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="My Card"><span>body</span></Card>);
    expect(screen.getByText('My Card')).toBeInTheDocument();
  });

  it('renders sub when provided', () => {
    render(<Card title="Title" sub="Subtitle"><span>body</span></Card>);
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('does not render header when no title or actions', () => {
    const { container } = render(<Card><span>body</span></Card>);
    expect(container.querySelector('.card-head')).not.toBeInTheDocument();
  });

  it('has class card', () => {
    const { container } = render(<Card><span>x</span></Card>);
    expect(container.firstChild).toHaveClass('card');
  });
});

// ── Stat ──────────────────────────────────────────────────────────────────────
describe('Stat', () => {
  it('renders label', () => {
    render(<Stat label="Revenue" value="$12k" icon="invoices" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(<Stat label="Revenue" value="$12k" icon="invoices" />);
    expect(screen.getByText('$12k')).toBeInTheDocument();
  });

  it('renders delta when provided', () => {
    render(<Stat label="Revenue" value="$12k" icon="invoices" delta="+12%" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders sub text when provided', () => {
    render(<Stat label="Revenue" value="$12k" icon="invoices" sub="vs last month" />);
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });
});

// ── Seg ───────────────────────────────────────────────────────────────────────
describe('Seg', () => {
  it('renders all options', () => {
    render(<Seg options={['List','Board','Calendar']} value="List" onChange={vi.fn()} />);
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Board')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('marks active option with "on" class', () => {
    render(<Seg options={['List','Board']} value="Board" onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toHaveClass('on');
    expect(buttons[1]).toHaveClass('on');
  });

  it('calls onChange with clicked option value', async () => {
    const handler = vi.fn();
    render(<Seg options={['List','Board']} value="List" onChange={handler} />);
    await userEvent.click(screen.getByText('Board'));
    expect(handler).toHaveBeenCalledWith('Board');
  });
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
describe('Tabs', () => {
  it('renders all tabs', () => {
    render(<Tabs tabs={['Profile','Security','Appearance']} value="Profile" onChange={vi.fn()} />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('marks active tab with "on" class', () => {
    render(<Tabs tabs={['Profile','Security']} value="Security" onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toHaveClass('on');
    expect(buttons[1]).toHaveClass('on');
  });

  it('calls onChange when a tab is clicked', async () => {
    const handler = vi.fn();
    render(<Tabs tabs={['Profile','Security']} value="Profile" onChange={handler} />);
    await userEvent.click(screen.getByText('Security'));
    expect(handler).toHaveBeenCalledWith('Security');
  });
});

// ── Search ────────────────────────────────────────────────────────────────────
describe('Search', () => {
  it('renders placeholder', () => {
    render(<Search placeholder="Search employees..." />);
    expect(screen.getByPlaceholderText('Search employees...')).toBeInTheDocument();
  });

  it('calls onChange on input', async () => {
    const handler = vi.fn();
    render(<Search onChange={handler} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(handler).toHaveBeenCalled();
    expect(handler).toHaveBeenLastCalledWith('hello');
  });

  it('displays controlled value', () => {
    render(<Search value="test" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });
});

// ── Select ────────────────────────────────────────────────────────────────────
describe('Select', () => {
  it('renders label', () => {
    render(<Select label="Status" value="All" options={['All','Active','Inactive']} onChange={vi.fn()} />);
    expect(screen.getByText('Status:')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select value="All" options={['All','Active','Inactive']} onChange={vi.fn()} />);
    const select = screen.getByRole('combobox');
    expect(select.options).toHaveLength(3);
  });

  it('calls onChange when selection changes', async () => {
    const handler = vi.fn();
    render(<Select value="All" options={['All','Active','Inactive']} onChange={handler} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Active');
    expect(handler).toHaveBeenCalledWith('Active');
  });
});

// ── EmptyState ────────────────────────────────────────────────────────────────
describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders children description', () => {
    render(<EmptyState title="Empty">Nothing to show here</EmptyState>);
    expect(screen.getByText('Nothing to show here')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<EmptyState title="Empty" action={<button>Add item</button>} />);
    expect(screen.getByText('Add item')).toBeInTheDocument();
  });
});

// ── PageHead ──────────────────────────────────────────────────────────────────
describe('PageHead', () => {
  it('renders title', () => {
    render(<PageHead title="Employees" />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
  });

  it('renders sub text when provided', () => {
    render(<PageHead title="Employees" sub="18 total" />);
    expect(screen.getByText('18 total')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(<PageHead title="Projects" actions={<button>New project</button>} />);
    expect(screen.getByText('New project')).toBeInTheDocument();
  });

  it('does not render sub when not provided', () => {
    const { container } = render(<PageHead title="Dashboard" />);
    expect(container.querySelector('.page-sub')).not.toBeInTheDocument();
  });
});
