import { useCallback, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { IconButton, Input } from '@design-system';
import { VisibilityIcon, VisibilityOffIcon } from '@design-system/icons';

import * as C from '@app/pages/Signup/constants';
import type { SignupFormValues } from '@app/pages/Signup/schema';
import * as S from '@app/pages/Signup/styles';
import { BirthDateField } from '../BirthDateField';

/** Identificação e acesso: os seis primeiros campos do cadastro. */
export function AccountSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const [passwordHidden, setPasswordHidden] = useState(true);

  const handleTogglePassword = useCallback(() => setPasswordHidden((hidden) => !hidden), []);

  return (
    <S.FieldGrid>
      <S.FullWidthCell>
        <Input
          {...register('fullName')}
          label={C.FIELD_LABELS.fullName}
          required
          fullWidth
          type="text"
          autoComplete="name"
          error={errors.fullName?.message}
        />
      </S.FullWidthCell>

      <S.ThirdWidthCell>
        <Input
          {...register('nickname')}
          label={C.FIELD_LABELS.nickname}
          fullWidth
          type="text"
          autoComplete="nickname"
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <Input
          {...register('fatecEmail')}
          label={C.FIELD_LABELS.fatecEmail}
          required
          fullWidth
          type="email"
          autoComplete="work email"
          placeholder={C.FIELD_PLACEHOLDERS.fatecEmail}
          error={errors.fatecEmail?.message}
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <BirthDateField />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Input.Select
              {...field}
              label={C.FIELD_LABELS.gender}
              options={C.GENDER_SELECT_OPTIONS}
              autoComplete="sex"
              required
              error={errors.gender?.message}
            />
          )}
        />
      </S.ThirdWidthCell>

      <S.ThirdWidthCell>
        <Input
          {...register('password')}
          label={C.FIELD_LABELS.password}
          required
          fullWidth
          type={passwordHidden ? 'password' : 'text'}
          autoComplete={passwordHidden ? 'new-password' : 'off'}
          error={errors.password?.message}
          endAdornment={
            <IconButton
              type="button"
              aria-label={C.PASSWORD_TOGGLE_LABEL}
              aria-pressed={!passwordHidden}
              onClick={handleTogglePassword}
            >
              {/* O ícone mostra o estado atual: olho aberto = senha visível. */}
              {passwordHidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          }
        />
      </S.ThirdWidthCell>
    </S.FieldGrid>
  );
}
