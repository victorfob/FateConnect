import { useCallback, useState } from 'react';
import { IconButton, Input } from '@design-system';
import { VisibilityIcon, VisibilityOffIcon } from '@design-system/icons';
import { Controller, useFormContext } from 'react-hook-form';

import { FIELD_LABELS, FIELD_PLACEHOLDERS } from '@app/pages/Signup/constants';
import type { SignupFormValues } from '@app/pages/Signup/schema';

import { BirthDateField } from '../BirthDateField';
import { GENDER_SELECT_OPTIONS, PASSWORD_TOGGLE_LABEL } from './constants';
import * as S from './styles';

export function AccountSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const [passwordHidden, setPasswordHidden] = useState(true);

  const handleTogglePassword = useCallback(() => setPasswordHidden((hidden) => !hidden), []);

  return (
    <>
      <S.FullWidthCell>
        <Input
          {...register('fullName')}
          label={FIELD_LABELS.fullName}
          required
          fullWidth
          type="text"
          autoComplete="name"
          error={errors.fullName?.message}
        />
      </S.FullWidthCell>

      <S.ThirdWidthCell>
        <Input
          {...register('fatecEmail')}
          label={FIELD_LABELS.fatecEmail}
          required
          fullWidth
          type="email"
          autoComplete="work email"
          placeholder={FIELD_PLACEHOLDERS.fatecEmail}
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
              label={FIELD_LABELS.gender}
              options={GENDER_SELECT_OPTIONS}
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
          label={FIELD_LABELS.password}
          required
          fullWidth
          type={passwordHidden ? 'password' : 'text'}
          autoComplete={passwordHidden ? 'new-password' : 'off'}
          error={errors.password?.message}
          endAdornment={
            <IconButton
              type="button"
              label={PASSWORD_TOGGLE_LABEL}
              aria-pressed={!passwordHidden}
              onClick={handleTogglePassword}
            >
              {/* O ícone mostra o estado atual: olho aberto = senha visível. */}
              {passwordHidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          }
        />
      </S.ThirdWidthCell>
    </>
  );
}
