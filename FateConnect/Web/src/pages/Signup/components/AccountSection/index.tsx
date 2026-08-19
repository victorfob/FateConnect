import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { IconButton, InputAdornment, TextField } from '@design-system';
import { VisibilityIcon, VisibilityOffIcon } from '@design-system/icons';

import * as C from '../../constants';
import type { SignupFormValues } from '../../schema';
import * as S from '../../styles';
import { BirthDateField } from '../BirthDateField';
import { SelectField } from '../SelectField';

/** Identificação e acesso: os seis primeiros campos do cadastro. */
export function AccountSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const [passwordHidden, setPasswordHidden] = useState(true);

  const handleTogglePassword = useCallback(() => setPasswordHidden((hidden) => !hidden), []);

  return (
    <S.FieldGrid>
      <S.FullWidthCell>
        <TextField
          {...register('fullName')}
          label={C.FIELD_LABELS.fullName}
          required
          fullWidth
          type="text"
          autoComplete="name"
          error={Boolean(errors.fullName)}
          helperText={errors.fullName?.message}
        />
      </S.FullWidthCell>

      <S.ThirdWidthCell>
        <TextField
          {...register('nickname')}
          label={C.FIELD_LABELS.nickname}
          fullWidth
          type="text"
          autoComplete="nickname"
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <TextField
          {...register('fatecEmail')}
          label={C.FIELD_LABELS.fatecEmail}
          required
          fullWidth
          type="email"
          autoComplete="work email"
          placeholder={C.FIELD_PLACEHOLDERS.fatecEmail}
          error={Boolean(errors.fatecEmail)}
          helperText={errors.fatecEmail?.message}
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <BirthDateField />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <SelectField
          name="gender"
          label={C.FIELD_LABELS.gender}
          options={C.GENDER_OPTIONS}
          autoComplete="sex"
          required
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <TextField
          {...register('password')}
          label={C.FIELD_LABELS.password}
          required
          fullWidth
          type={passwordHidden ? 'password' : 'text'}
          autoComplete={passwordHidden ? 'new-password' : 'off'}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    aria-label={C.PASSWORD_TOGGLE_LABEL}
                    aria-pressed={!passwordHidden}
                    onClick={handleTogglePassword}
                  >
                    {/* O ícone mostra o estado atual: olho aberto = senha visível. */}
                    {passwordHidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </S.ThirdWidthCell>
    </S.FieldGrid>
  );
}
