export type FormulaItem = {
  name: string
  expression: string
  note: string
}

export type FormulaChapter = {
  id: string
  subject: 'physics' | 'chemistry'
  title: string
  summary: string
  formulas: FormulaItem[]
}

export const formulaBank: FormulaChapter[] = [
  {
    id: 'physics-mechanics',
    subject: 'physics',
    title: 'Mechanics',
    summary:
      'Units, vectors, motion, force, energy, rotation, fluids, and gravity.',
    formulas: [
      {
        name: 'Dimensional formula',
        expression: '[Q] = M^a L^b T^c',
        note: 'Use for checking units and deriving relations.',
      },
      {
        name: 'Resultant vector',
        expression: 'R = sqrt(A^2 + B^2 + 2AB cos theta)',
        note: 'For two vectors with angle theta between them.',
      },
      {
        name: 'Velocity',
        expression: 'v = u + at',
        note: 'Uniform acceleration only.',
      },
      {
        name: 'Displacement',
        expression: 's = ut + (1/2)at^2',
        note: 'Use sign convention carefully.',
      },
      {
        name: 'Velocity-displacement',
        expression: 'v^2 = u^2 + 2as',
        note: 'Useful when time is not given.',
      },
      {
        name: 'Projectile range',
        expression: 'R = u^2 sin(2 theta) / g',
        note: 'Same landing level.',
      },
      {
        name: 'Projectile height',
        expression: 'H = u^2 sin^2(theta) / 2g',
        note: 'Maximum vertical height.',
      },
      {
        name: 'Newton force',
        expression: 'F = ma',
        note: 'Net force equals mass times acceleration.',
      },
      {
        name: 'Friction',
        expression: 'f = mu N',
        note: 'Limiting friction uses mu_s; kinetic uses mu_k.',
      },
      {
        name: 'Work',
        expression: 'W = Fs cos theta',
        note: 'Only component along displacement does work.',
      },
      {
        name: 'Kinetic energy',
        expression: 'K = (1/2)mv^2',
        note: 'Energy due to motion.',
      },
      {
        name: 'Power',
        expression: 'P = W/t = Fv',
        note: 'Fv applies when force and velocity are parallel.',
      },
      {
        name: 'Centripetal force',
        expression: 'F = mv^2/r = m omega^2 r',
        note: 'Directed toward the center.',
      },
      {
        name: 'Torque',
        expression: 'tau = rF sin theta',
        note: 'Rotational effect of force.',
      },
      {
        name: 'Angular motion',
        expression: 'omega = omega0 + alpha t',
        note: 'Rotational version of v = u + at.',
      },
      {
        name: 'Moment of inertia',
        expression: 'I = sum mr^2',
        note: 'Depends on axis of rotation.',
      },
      {
        name: 'Rotational kinetic energy',
        expression: 'K = (1/2)I omega^2',
        note: 'For rotating bodies.',
      },
      {
        name: 'Gravitation',
        expression: 'F = Gm1m2/r^2',
        note: 'Attractive force between masses.',
      },
      {
        name: 'Acceleration due to gravity',
        expression: 'g = GM/R^2',
        note: 'At surface of a planet.',
      },
      {
        name: 'Escape velocity',
        expression: 'v_e = sqrt(2GM/R)',
        note: 'Minimum speed to escape gravity.',
      },
      {
        name: 'Young modulus',
        expression: 'Y = stress/strain = (F/A)/(delta L/L)',
        note: 'Elasticity of wires and rods.',
      },
      { name: 'Pressure', expression: 'P = F/A', note: 'Force per unit area.' },
      {
        name: 'Hydrostatic pressure',
        expression: 'P = h rho g',
        note: 'Pressure due to liquid column.',
      },
      {
        name: 'Continuity equation',
        expression: 'A1v1 = A2v2',
        note: 'For steady incompressible flow.',
      },
      {
        name: 'Bernoulli equation',
        expression: 'P + (1/2)rho v^2 + rho gh = constant',
        note: 'Energy conservation in fluid flow.',
      },
    ],
  },
  {
    id: 'physics-heat-thermodynamics',
    subject: 'physics',
    title: 'Heat and Thermodynamics',
    summary:
      'Thermal expansion, calorimetry, gas laws, heat transfer, and thermodynamics.',
    formulas: [
      {
        name: 'Temperature conversion',
        expression: 'K = C + 273',
        note: 'Use Kelvin in gas law calculations.',
      },
      {
        name: 'Heat supplied',
        expression: 'Q = mc delta T',
        note: 'No phase change.',
      },
      {
        name: 'Latent heat',
        expression: 'Q = mL',
        note: 'During phase change at constant temperature.',
      },
      {
        name: 'Linear expansion',
        expression: 'delta L = alpha L delta T',
        note: 'For length expansion.',
      },
      {
        name: 'Area expansion',
        expression: 'delta A = beta A delta T',
        note: 'Usually beta = 2 alpha.',
      },
      {
        name: 'Volume expansion',
        expression: 'delta V = gamma V delta T',
        note: 'Usually gamma = 3 alpha for solids.',
      },
      {
        name: 'Ideal gas equation',
        expression: 'PV = nRT',
        note: 'Use SI units for numerical work.',
      },
      {
        name: 'Boyle law',
        expression: 'P1V1 = P2V2',
        note: 'Temperature constant.',
      },
      {
        name: 'Charles law',
        expression: 'V1/T1 = V2/T2',
        note: 'Pressure constant.',
      },
      {
        name: 'Pressure law',
        expression: 'P1/T1 = P2/T2',
        note: 'Volume constant.',
      },
      {
        name: 'First law',
        expression: 'delta Q = delta U + W',
        note: 'Heat supplied equals internal energy change plus work done.',
      },
      {
        name: 'Work by gas',
        expression: 'W = P delta V',
        note: 'Constant pressure process.',
      },
      {
        name: 'Adiabatic equation',
        expression: 'PV^gamma = constant',
        note: 'No heat exchange.',
      },
      {
        name: 'Carnot efficiency',
        expression: 'eta = 1 - T2/T1',
        note: 'Temperatures must be in Kelvin.',
      },
      {
        name: 'Thermal conduction',
        expression: 'Q/t = kA delta T / l',
        note: 'Steady heat flow through slab.',
      },
      {
        name: 'Newton cooling',
        expression: 'dT/dt proportional to -(T - T_s)',
        note: 'Cooling rate depends on temperature excess.',
      },
    ],
  },
  {
    id: 'physics-waves-optics',
    subject: 'physics',
    title: 'Waves and Optics',
    summary:
      'SHM, waves, sound, reflection, refraction, lenses, and interference.',
    formulas: [
      {
        name: 'SHM displacement',
        expression: 'x = A sin(omega t + phi)',
        note: 'General simple harmonic motion.',
      },
      {
        name: 'SHM acceleration',
        expression: 'a = -omega^2 x',
        note: 'Acceleration is opposite displacement.',
      },
      {
        name: 'Time period spring',
        expression: 'T = 2 pi sqrt(m/k)',
        note: 'Mass-spring oscillator.',
      },
      {
        name: 'Simple pendulum',
        expression: 'T = 2 pi sqrt(l/g)',
        note: 'Small oscillations only.',
      },
      {
        name: 'Wave speed',
        expression: 'v = f lambda',
        note: 'Basic wave relation.',
      },
      {
        name: 'String wave speed',
        expression: 'v = sqrt(T/mu)',
        note: 'mu is mass per unit length.',
      },
      {
        name: 'Sound intensity level',
        expression: 'beta = 10 log(I/I0)',
        note: 'Measured in decibel.',
      },
      {
        name: 'Doppler effect',
        expression: 'f_prime = f(v +/- vo)/(v -/+ vs)',
        note: 'Choose signs from relative motion.',
      },
      {
        name: 'Refractive index',
        expression: 'n = c/v',
        note: 'Speed ratio in vacuum and medium.',
      },
      {
        name: 'Snell law',
        expression: 'n1 sin i = n2 sin r',
        note: 'For refraction at a boundary.',
      },
      {
        name: 'Critical angle',
        expression: 'sin C = 1/n',
        note: 'From denser medium to air.',
      },
      {
        name: 'Mirror formula',
        expression: '1/f = 1/v + 1/u',
        note: 'Use sign convention.',
      },
      {
        name: 'Lens formula',
        expression: '1/f = 1/v - 1/u',
        note: 'Cartesian sign convention.',
      },
      {
        name: 'Magnification',
        expression: 'm = h_i/h_o = v/u',
        note: 'Sign shows image nature.',
      },
      {
        name: 'Lens power',
        expression: 'P = 1/f',
        note: 'f in meter; unit diopter.',
      },
      {
        name: 'Young fringe width',
        expression: 'beta = lambda D/d',
        note: 'Double slit interference.',
      },
      {
        name: 'Diffraction grating',
        expression: 'd sin theta = n lambda',
        note: 'Principal maxima.',
      },
    ],
  },
  {
    id: 'physics-electricity-magnetism',
    subject: 'physics',
    title: 'Current Electricity and Magnetism',
    summary:
      'Current, circuits, resistance, AC, magnetic force, and induction.',
    formulas: [
      {
        name: 'Current',
        expression: 'I = Q/t',
        note: 'Rate of flow of charge.',
      },
      { name: 'Ohm law', expression: 'V = IR', note: 'For ohmic conductors.' },
      {
        name: 'Resistance',
        expression: 'R = rho l/A',
        note: 'Depends on material and geometry.',
      },
      {
        name: 'Series resistance',
        expression: 'R = R1 + R2 + ...',
        note: 'Same current through each resistor.',
      },
      {
        name: 'Parallel resistance',
        expression: '1/R = 1/R1 + 1/R2 + ...',
        note: 'Same potential difference.',
      },
      {
        name: 'Electric power',
        expression: 'P = VI = I^2R = V^2/R',
        note: 'Power consumed in circuits.',
      },
      {
        name: 'Joule heat',
        expression: 'H = I^2Rt',
        note: 'Heating effect of current.',
      },
      {
        name: 'Kirchhoff junction law',
        expression: 'sum I_in = sum I_out',
        note: 'Charge conservation.',
      },
      {
        name: 'Kirchhoff loop law',
        expression: 'sum V = 0',
        note: 'Energy conservation in a loop.',
      },
      {
        name: 'Magnetic force on charge',
        expression: 'F = qvB sin theta',
        note: 'Moving charge in magnetic field.',
      },
      {
        name: 'Force on conductor',
        expression: 'F = BIL sin theta',
        note: 'Current-carrying wire in magnetic field.',
      },
      {
        name: 'Field near long wire',
        expression: 'B = mu0 I / 2 pi r',
        note: 'Magnetic field around straight wire.',
      },
      {
        name: 'Solenoid field',
        expression: 'B = mu0 n I',
        note: 'Inside long solenoid.',
      },
      {
        name: 'Faraday law',
        expression: 'E = -N d phi/dt',
        note: 'Induced emf opposes flux change.',
      },
      {
        name: 'Motional emf',
        expression: 'E = Blv',
        note: 'Rod moving perpendicular to magnetic field.',
      },
      {
        name: 'Inductive reactance',
        expression: 'X_L = 2 pi f L',
        note: 'AC circuit with inductor.',
      },
      {
        name: 'Capacitive reactance',
        expression: 'X_C = 1/(2 pi f C)',
        note: 'AC circuit with capacitor.',
      },
      {
        name: 'Transformer',
        expression: 'Vs/Vp = Ns/Np',
        note: 'Ideal transformer relation.',
      },
    ],
  },
  {
    id: 'physics-electrostatics',
    subject: 'physics',
    title: 'Electrostatics and Capacitors',
    summary: 'Electric charge, field, potential, Gauss law, and capacitors.',
    formulas: [
      {
        name: 'Coulomb law',
        expression: 'F = k q1q2/r^2',
        note: 'Force between point charges.',
      },
      {
        name: 'Electric field',
        expression: 'E = F/q',
        note: 'Force per unit test charge.',
      },
      {
        name: 'Field due to point charge',
        expression: 'E = kq/r^2',
        note: 'Radial field.',
      },
      {
        name: 'Electric potential',
        expression: 'V = kq/r',
        note: 'Potential due to point charge.',
      },
      {
        name: 'Potential energy',
        expression: 'U = kq1q2/r',
        note: 'Energy of two point charges.',
      },
      {
        name: 'Uniform field relation',
        expression: 'E = V/d',
        note: 'Between parallel plates.',
      },
      {
        name: 'Gauss law',
        expression: 'phi = q_enclosed / epsilon0',
        note: 'Flux through closed surface.',
      },
      {
        name: 'Capacitance',
        expression: 'C = Q/V',
        note: 'Charge stored per unit potential.',
      },
      {
        name: 'Parallel plate capacitor',
        expression: 'C = epsilon0 A/d',
        note: 'Without dielectric.',
      },
      {
        name: 'Capacitor energy',
        expression: 'U = (1/2)CV^2 = Q^2/2C',
        note: 'Energy stored in capacitor.',
      },
      {
        name: 'Series capacitors',
        expression: '1/C = 1/C1 + 1/C2 + ...',
        note: 'Same charge on each.',
      },
      {
        name: 'Parallel capacitors',
        expression: 'C = C1 + C2 + ...',
        note: 'Same voltage across each.',
      },
    ],
  },
  {
    id: 'physics-modern-physics',
    subject: 'physics',
    title: 'Modern Physics',
    summary:
      'Photoelectric effect, atoms, nuclei, radioactivity, and semiconductors.',
    formulas: [
      {
        name: 'Photon energy',
        expression: 'E = hf = hc/lambda',
        note: 'Energy of one photon.',
      },
      {
        name: 'Photoelectric equation',
        expression: 'hf = phi + Kmax',
        note: 'Einstein photoelectric equation.',
      },
      {
        name: 'Stopping potential',
        expression: 'Kmax = eV0',
        note: 'Maximum kinetic energy of photoelectron.',
      },
      {
        name: 'de Broglie wavelength',
        expression: 'lambda = h/p = h/mv',
        note: 'Matter wave relation.',
      },
      {
        name: 'Bohr radius',
        expression: 'r_n = n^2 r_1',
        note: 'Hydrogen-like atom.',
      },
      {
        name: 'Bohr energy',
        expression: 'E_n = -13.6 Z^2/n^2 eV',
        note: 'Hydrogen-like atom.',
      },
      {
        name: 'X-ray cutoff wavelength',
        expression: 'lambda_min = hc/eV',
        note: 'Continuous X-ray spectrum.',
      },
      {
        name: 'Radioactive decay',
        expression: 'N = N0 e^(-lambda t)',
        note: 'Remaining nuclei after time t.',
      },
      {
        name: 'Half-life',
        expression: 'T_1/2 = 0.693/lambda',
        note: 'Time for half nuclei to decay.',
      },
      {
        name: 'Mass-energy',
        expression: 'E = mc^2',
        note: 'Energy equivalent of mass.',
      },
      {
        name: 'Binding energy',
        expression: 'BE = delta m c^2',
        note: 'Mass defect converted to energy.',
      },
      {
        name: 'Diode current',
        expression: 'I = I0(e^(V/eta V_T) - 1)',
        note: 'Qualitative semiconductor relation.',
      },
    ],
  },
  {
    id: 'chemistry-basic-stoichiometry',
    subject: 'chemistry',
    title: 'Basic Concepts and Stoichiometry',
    summary:
      'Mole concept, concentration, empirical formula, gases, and yield.',
    formulas: [
      {
        name: 'Moles from mass',
        expression: 'n = mass / molar mass',
        note: 'Use grams and g mol^-1.',
      },
      {
        name: 'Number of particles',
        expression: 'N = n N_A',
        note: 'N_A = Avogadro constant.',
      },
      {
        name: 'Molarity',
        expression: 'M = moles of solute / volume in L',
        note: 'Most common concentration unit.',
      },
      {
        name: 'Molality',
        expression: 'm = moles of solute / kg solvent',
        note: 'Temperature independent.',
      },
      {
        name: 'Normality',
        expression: 'N = gram equivalent / volume in L',
        note: 'Depends on reaction type.',
      },
      {
        name: 'Dilution',
        expression: 'M1V1 = M2V2',
        note: 'Moles conserved during dilution.',
      },
      {
        name: 'Equivalent relation',
        expression: 'N1V1 = N2V2',
        note: 'Useful for titration.',
      },
      {
        name: 'Mass percentage',
        expression: '% w/w = mass solute / mass solution x 100',
        note: 'Composition by mass.',
      },
      {
        name: 'Empirical formula',
        expression: 'moles = percentage / atomic mass',
        note: 'Divide by smallest mole ratio.',
      },
      {
        name: 'Percentage yield',
        expression: '% yield = actual yield / theoretical yield x 100',
        note: 'Measures reaction efficiency.',
      },
      {
        name: 'Ideal gas equation',
        expression: 'PV = nRT',
        note: 'Use R = 0.0821 L atm mol^-1 K^-1 or 8.314 SI.',
      },
      {
        name: 'Gas density',
        expression: 'd = PM/RT',
        note: 'From ideal gas equation.',
      },
    ],
  },
  {
    id: 'chemistry-atomic-structure-bonding',
    subject: 'chemistry',
    title: 'Atomic Structure and Chemical Bonding',
    summary:
      'Quantum numbers, Bohr model, photons, formal charge, and bond properties.',
    formulas: [
      {
        name: 'Photon energy',
        expression: 'E = hf = hc/lambda',
        note: 'Used in spectra and atomic structure.',
      },
      {
        name: 'de Broglie wavelength',
        expression: 'lambda = h/mv',
        note: 'Wave nature of electron.',
      },
      {
        name: 'Bohr energy',
        expression: 'E_n = -13.6 Z^2/n^2 eV',
        note: 'Hydrogen-like species.',
      },
      {
        name: 'Bohr radius',
        expression: 'r_n = 0.529 n^2/Z angstrom',
        note: 'Hydrogen-like species.',
      },
      {
        name: 'Rydberg equation',
        expression: '1/lambda = RZ^2(1/n1^2 - 1/n2^2)',
        note: 'Atomic spectra.',
      },
      {
        name: 'Heisenberg uncertainty',
        expression: 'delta x delta p >= h/4 pi',
        note: 'Position and momentum limit.',
      },
      {
        name: 'Formal charge',
        expression: 'FC = V - L - B/2',
        note: 'V valence, L lone-pair electrons, B bonding electrons.',
      },
      {
        name: 'Dipole moment',
        expression: 'mu = q x r',
        note: 'Polarity of bond or molecule.',
      },
      {
        name: 'Bond order',
        expression: 'BO = (bonding e- - antibonding e-) / 2',
        note: 'Molecular orbital theory.',
      },
    ],
  },
  {
    id: 'chemistry-equilibrium-ionic',
    subject: 'chemistry',
    title: 'Chemical and Ionic Equilibrium',
    summary:
      'Equilibrium constants, pH, acids, bases, buffers, and solubility.',
    formulas: [
      {
        name: 'Equilibrium constant',
        expression: 'Kc = [products]^coeff / [reactants]^coeff',
        note: 'For concentration equilibrium.',
      },
      {
        name: 'Kp and Kc',
        expression: 'Kp = Kc(RT)^delta n',
        note: 'Gas equilibrium only.',
      },
      {
        name: 'Reaction quotient',
        expression: 'Q = product ratio / reactant ratio',
        note: 'Compare Q with K.',
      },
      {
        name: 'Ionic product of water',
        expression: 'Kw = [H+][OH-]',
        note: 'At 25 C, Kw = 1.0 x 10^-14.',
      },
      { name: 'pH', expression: 'pH = -log[H+]', note: 'Acidity scale.' },
      {
        name: 'pOH',
        expression: 'pOH = -log[OH-]',
        note: 'pH + pOH = 14 at 25 C.',
      },
      {
        name: 'Acid dissociation',
        expression: 'Ka = [H+][A-]/[HA]',
        note: 'Weak acid equilibrium.',
      },
      {
        name: 'Base dissociation',
        expression: 'Kb = [BH+][OH-]/[B]',
        note: 'Weak base equilibrium.',
      },
      {
        name: 'Ka Kb relation',
        expression: 'Ka x Kb = Kw',
        note: 'For conjugate acid-base pair.',
      },
      {
        name: 'Henderson equation',
        expression: 'pH = pKa + log([salt]/[acid])',
        note: 'Acidic buffer.',
      },
      {
        name: 'Solubility product',
        expression: 'Ksp = [cation]^m[anion]^n',
        note: 'For sparingly soluble salts.',
      },
      {
        name: 'Degree of dissociation',
        expression: 'alpha = dissociated amount / initial amount',
        note: 'Often used with weak electrolytes.',
      },
    ],
  },
  {
    id: 'chemistry-kinetics',
    subject: 'chemistry',
    title: 'Chemical Kinetics',
    summary:
      'Rate law, order, integrated rate equations, half-life, and activation energy.',
    formulas: [
      {
        name: 'Rate law',
        expression: 'rate = k[A]^m[B]^n',
        note: 'Order = m + n.',
      },
      {
        name: 'Zero order integrated law',
        expression: '[A] = [A]0 - kt',
        note: 'Straight line of [A] vs t.',
      },
      {
        name: 'First order integrated law',
        expression: 'k = (2.303/t) log([A]0/[A])',
        note: 'Most common CEE formula.',
      },
      {
        name: 'First order half-life',
        expression: 't1/2 = 0.693/k',
        note: 'Independent of initial concentration.',
      },
      {
        name: 'Second order half-life',
        expression: 't1/2 = 1/(k[A]0)',
        note: 'For one reactant second order.',
      },
      {
        name: 'Arrhenius equation',
        expression: 'k = A e^(-Ea/RT)',
        note: 'Temperature dependence of rate.',
      },
      {
        name: 'Arrhenius two-temperature',
        expression: 'log(k2/k1) = Ea/(2.303R)(1/T1 - 1/T2)',
        note: 'Find activation energy or rate constant.',
      },
    ],
  },
  {
    id: 'chemistry-thermodynamics',
    subject: 'chemistry',
    title: 'Chemical Thermodynamics',
    summary:
      'Heat, enthalpy, entropy, Gibbs energy, equilibrium, and spontaneity.',
    formulas: [
      {
        name: 'Heat at constant pressure',
        expression: 'q_p = delta H',
        note: 'Enthalpy change.',
      },
      {
        name: 'Heat at constant volume',
        expression: 'q_v = delta U',
        note: 'Internal energy change.',
      },
      {
        name: 'First law',
        expression: 'delta U = q + w',
        note: 'Chemistry sign convention.',
      },
      {
        name: 'Pressure-volume work',
        expression: 'w = -P delta V',
        note: 'Expansion gives negative work.',
      },
      {
        name: 'Enthalpy relation',
        expression: 'delta H = delta U + delta n_g RT',
        note: 'For gaseous reactions.',
      },
      {
        name: 'Hess law',
        expression:
          'delta H_rxn = sum delta H_products - sum delta H_reactants',
        note: 'Use formation enthalpies.',
      },
      {
        name: 'Entropy change',
        expression: 'delta S = q_rev/T',
        note: 'For reversible heat transfer.',
      },
      {
        name: 'Gibbs energy',
        expression: 'delta G = delta H - T delta S',
        note: 'Spontaneous if delta G < 0.',
      },
      {
        name: 'Gibbs and equilibrium',
        expression: 'delta G = delta G0 + RT ln Q',
        note: 'At equilibrium delta G = 0.',
      },
      {
        name: 'Equilibrium link',
        expression: 'delta G0 = -RT ln K',
        note: 'Thermodynamic meaning of K.',
      },
    ],
  },
  {
    id: 'chemistry-electrochemistry',
    subject: 'chemistry',
    title: 'Electrochemistry',
    summary:
      'Conductance, cells, Nernst equation, Faraday laws, and electrolysis.',
    formulas: [
      {
        name: 'Conductance',
        expression: 'G = 1/R',
        note: 'Reciprocal of resistance.',
      },
      {
        name: 'Specific conductance',
        expression: 'kappa = cell constant / R',
        note: 'Cell constant = l/A.',
      },
      {
        name: 'Molar conductance',
        expression: 'Lambda_m = kappa x 1000 / M',
        note: 'M in mol L^-1.',
      },
      {
        name: 'Cell emf',
        expression: 'Ecell = Ecathode - Eanode',
        note: 'Use reduction potentials.',
      },
      {
        name: 'Nernst equation',
        expression: 'E = E0 - (0.0591/n) log Q',
        note: 'At 25 C.',
      },
      {
        name: 'Gibbs and emf',
        expression: 'delta G = -nFEcell',
        note: 'Cell work relation.',
      },
      {
        name: 'Equilibrium and emf',
        expression: 'E0 = (0.0591/n) log K',
        note: 'At 25 C.',
      },
      {
        name: 'Faraday electrolysis',
        expression: 'm = ZIt',
        note: 'Mass deposited.',
      },
      {
        name: 'Faraday charge',
        expression: 'Q = It',
        note: 'Charge passed through electrolyte.',
      },
      {
        name: 'Equivalent mass deposit',
        expression: 'm = EIt/F',
        note: 'E is equivalent mass.',
      },
    ],
  },
  {
    id: 'chemistry-solutions-colligative',
    subject: 'chemistry',
    title: 'Solutions and Colligative Properties',
    summary:
      'Vapour pressure, boiling point, freezing point, osmotic pressure, and van Hoff factor.',
    formulas: [
      {
        name: 'Raoult law',
        expression: 'p = x p0',
        note: 'Partial pressure in ideal solution.',
      },
      {
        name: 'Relative lowering',
        expression: '(p0 - p)/p0 = x_solute',
        note: 'For dilute nonvolatile solute.',
      },
      {
        name: 'Elevation of boiling point',
        expression: 'delta Tb = i Kb m',
        note: 'i is van Hoff factor.',
      },
      {
        name: 'Depression of freezing point',
        expression: 'delta Tf = i Kf m',
        note: 'Used for molar mass.',
      },
      {
        name: 'Osmotic pressure',
        expression: 'pi = iCRT',
        note: 'C is molarity.',
      },
      {
        name: 'van Hoff factor',
        expression: 'i = observed colligative property / normal value',
        note: 'Shows association or dissociation.',
      },
    ],
  },
  {
    id: 'chemistry-organic-analytical',
    subject: 'chemistry',
    title: 'Organic and Analytical Chemistry',
    summary:
      'Organic composition, unsaturation, titration, chromatography, and common calculations.',
    formulas: [
      {
        name: 'Degree of unsaturation',
        expression: 'DBE = C - H/2 + N/2 + 1',
        note: 'Ignore O and S; subtract halogens from H.',
      },
      {
        name: 'Percentage composition',
        expression: '% element = mass element / molar mass x 100',
        note: 'For molecular formula problems.',
      },
      {
        name: 'Empirical formula mass ratio',
        expression: 'mole ratio = mass or % / atomic mass',
        note: 'Convert composition to formula.',
      },
      {
        name: 'Combustion CO2 relation',
        expression: 'moles C = moles CO2',
        note: 'Find carbon in organic compound.',
      },
      {
        name: 'Combustion H2O relation',
        expression: 'moles H = 2 x moles H2O',
        note: 'Find hydrogen in organic compound.',
      },
      {
        name: 'Titration relation',
        expression: 'N1V1 = N2V2',
        note: 'Equivalent-based titration shortcut.',
      },
      {
        name: 'Molar titration',
        expression: 'M1V1/n1 = M2V2/n2',
        note: 'n is stoichiometric coefficient.',
      },
      {
        name: 'Rf value',
        expression: 'Rf = distance by solute / distance by solvent front',
        note: 'Paper or TLC chromatography.',
      },
      {
        name: 'Atom economy',
        expression:
          '% atom economy = desired product mass / total reactant mass x 100',
        note: 'Green chemistry calculation.',
      },
    ],
  },
]
