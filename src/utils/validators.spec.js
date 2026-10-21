import { isAllowedEmail, validarRun, validarImagen, REGISTER_RULES, LOGIN_RULES, PRODUCT_RULES } from './validators';

describe('validators', () => {
  describe('isAllowedEmail', () => {
    it('acepta los dominios permitidos', () => {
      expect(isAllowedEmail('a@gmail.com')).toBeTrue();
      expect(isAllowedEmail('a@duoc.cl')).toBeTrue();
      expect(isAllowedEmail('a@profesor.duoc.cl')).toBeTrue();
    });

    it('rechaza otros dominios', () => {
      expect(isAllowedEmail('a@hotmail.com')).toBeFalse();
      expect(isAllowedEmail('sin-arroba')).toBeFalse();
    });
  });

  describe('validarRun', () => {
    it('acepta un RUN con dígito verificador correcto', () => {
      expect(validarRun('111111111')).toBeTrue();
    });

    it('rechaza un dígito verificador incorrecto', () => {
      expect(validarRun('111111112')).toBeFalse();
    });

    it('rechaza formatos inválidos', () => {
      expect(validarRun('11.111.111-1')).toBeFalse();
      expect(validarRun('abc')).toBeFalse();
    });
  });

  describe('LOGIN_RULES', () => {
    it('exige correo y contraseña', () => {
      expect(LOGIN_RULES.email('')).toBe('Este campo es obligatorio');
      expect(LOGIN_RULES.password('')).toBe('Este campo es obligatorio');
    });

    it('valida el largo de la contraseña (4 a 10)', () => {
      expect(LOGIN_RULES.password('abc')).not.toBe('');
      expect(LOGIN_RULES.password('abcd')).toBe('');
      expect(LOGIN_RULES.password('12345678901')).not.toBe('');
    });
  });

  describe('REGISTER_RULES', () => {
    it('verifica que los correos coincidan', () => {
      const values = { email: 'a@duoc.cl' };
      expect(REGISTER_RULES.emailConfirm('a@duoc.cl', values)).toBe('');
      expect(REGISTER_RULES.emailConfirm('b@duoc.cl', values)).toBe('Los correos no coinciden');
    });

    it('verifica que las contraseñas coincidan', () => {
      const values = { password: 'abcd' };
      expect(REGISTER_RULES.passwordConfirm('abcd', values)).toBe('');
      expect(REGISTER_RULES.passwordConfirm('abce', values)).toBe('Las contraseñas no coinciden');
    });

    it('rechaza fechas de nacimiento futuras', () => {
      expect(REGISTER_RULES.fechaNacimiento('2999-01-01')).toBe('La fecha no puede ser futura');
      expect(REGISTER_RULES.fechaNacimiento('')).toBe('');
    });

    it('valida el teléfono (opcional, 8 a 12 dígitos)', () => {
      expect(REGISTER_RULES.telefono('')).toBe('');
      expect(REGISTER_RULES.telefono('+56912345678')).toBe('');
      expect(REGISTER_RULES.telefono('123')).not.toBe('');
    });
  });

  describe('PRODUCT_RULES', () => {
    it('exige nombre y limita su largo', () => {
      expect(PRODUCT_RULES.name('')).toBe('Este campo es obligatorio');
      expect(PRODUCT_RULES.name('x'.repeat(81))).not.toBe('');
      expect(PRODUCT_RULES.name('Control DualSense')).toBe('');
    });

    it('exige categoría', () => {
      expect(PRODUCT_RULES.category('')).toBe('Selecciona una categoría');
      expect(PRODUCT_RULES.category('Consolas')).toBe('');
    });

    it('valida que el precio sea un entero mayor a 0', () => {
      expect(PRODUCT_RULES.price('')).not.toBe('');
      expect(PRODUCT_RULES.price('abc')).not.toBe('');
      expect(PRODUCT_RULES.price('12.5')).not.toBe('');
      expect(PRODUCT_RULES.price('0')).not.toBe('');
      expect(PRODUCT_RULES.price('49990')).toBe('');
    });

    it('valida que el stock sea un entero (puede ser 0)', () => {
      expect(PRODUCT_RULES.stock('')).not.toBe('');
      expect(PRODUCT_RULES.stock('-1')).not.toBe('');
      expect(PRODUCT_RULES.stock('0')).toBe('');
      expect(PRODUCT_RULES.stock('25')).toBe('');
    });

    it('exige descripción de máximo 300 caracteres', () => {
      expect(PRODUCT_RULES.desc('')).not.toBe('');
      expect(PRODUCT_RULES.desc('x'.repeat(301))).not.toBe('');
      expect(PRODUCT_RULES.desc('Control inalámbrico')).toBe('');
    });
  });

  describe('validarImagen', () => {
    it('acepta que no haya imagen (es opcional)', () => {
      expect(validarImagen(undefined)).toBe('');
    });

    it('rechaza archivos que no son imagen', () => {
      expect(validarImagen({ type: 'application/pdf', size: 100 })).not.toBe('');
    });

    it('rechaza imágenes de más de 5 MB', () => {
      expect(validarImagen({ type: 'image/png', size: 6 * 1024 * 1024 })).not.toBe('');
    });

    it('acepta una imagen válida', () => {
      expect(validarImagen({ type: 'image/png', size: 1024 })).toBe('');
    });
  });
});
