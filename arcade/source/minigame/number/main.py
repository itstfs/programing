from random import randint

computador = randint(0, 5)
print('=-'*30)
numeroDigitado = int(input("Chute um número de 0 até 5: "))

if computador == numeroDigitado:
    print(f"Parabéns, o número que você digitou foi \33[35m{numeroDigitado}\33[m, e o número que pensei foi \33[33m{computador}\33[m.")
    print('=-'*30)
elif numeroDigitado >= 6 or numeroDigitado < 0:
    print("Você é louco? Digite um número entre 0 a 5.")

else:
    print(f"Que triste, você errou. Você digitou \33[35m{numeroDigitado}\33[m e eu pensei no número \33[33m{computador}\33[m.")
    print('=-'*30)