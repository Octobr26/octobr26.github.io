# Design System

## Direction

The page should feel like a scientific plotter running after dark: precise, energetic, and slightly unpredictable.
The double-pendulum trace is the dominant image and the interface behaves like labeling around an experiment.

## Color

- Background: `oklch(15% 0.045 273)`
- Primary text: `oklch(96% 0.015 105)`
- Muted text: `oklch(78% 0.025 260)`
- Primary trace: `oklch(84% 0.22 131)`
- Secondary trace: `oklch(72% 0.25 28)`
- Tertiary trace: `oklch(80% 0.19 210)`
- Focus: `oklch(90% 0.2 102)`

Use a drenched dark field with simulation colors carrying the identity.
Do not use gradients, translucent surfaces, or neutral cards.

## Typography

Use Anybody for the display statement and Azeret Mono for labels, instructions, and links.
Typography should resemble an experimental poster paired with instrument annotations.
Headings use fluid sizing with a maximum below 6rem and letter spacing no tighter than `-0.04em`.

## Layout

The canvas fills the viewport.
Metadata occupies the edges of the composition and leaves the center open for motion.
On narrow screens, keep the name at the top and stack the explanation above the bottom links.

## Components

There are no cards, pills, navigation bars, modals, or decorative controls.
Interactive affordances are plain text links, a visible focus outline around the stage, and direct canvas interaction.

## Motion

Several double pendulums begin with nearly identical angles and diverge over time.
Their end points leave persistent traces while one physical pendulum remains visible.
Pointer input resets the initial conditions and keyboard input supports pause and reset.
When reduced motion is requested, render a deterministic static trace and do not animate continuously.
