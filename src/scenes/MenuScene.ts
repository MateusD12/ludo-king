import Phaser from 'phaser'
import { PLAYER_COLORS, PlayerColor } from '../constants/Colors'

export type SlotType = 'HUMAN' | 'AI' | 'EMPTY'

export interface GameSetup {
  slots: SlotType[]
}

const COLOR_ORDER: PlayerColor[] = ['GREEN', 'YELLOW', 'BLUE', 'RED']
const COLOR_PT: Record<PlayerColor, string> = {
  GREEN: 'Verde', YELLOW: 'Amarelo', BLUE: 'Azul', RED: 'Vermelho'
}

export class MenuScene extends Phaser.Scene {
  // Slots: Verde, Amarelo, Azul, Vermelho
  private slots: PlayerConfigType[] = ['JOGADOR 1', 'ROBÔ', 'VAZIO', 'VAZIO']
  
  private configContainer!: Phaser.GameObjects.Container
  private mainContainer!: Phaser.GameObjects.Container
  
  // Elementos UI para poder atualizá-los
  private slotUI: { typeText: Phaser.GameObjects.Text }[] = []
  private btnStart!: Phaser.GameObjects.Text
  private bgImage!: Phaser.GameObjects.Image

  constructor() { super('MenuScene') }

  preload() {
    this.load.image('board_bg', 'assets/tavern_desk_bg.png')
    this.load.image('menu_bg', 'assets/menu_1.png')
    this.load.image('menu_bg_2', 'assets/menu_2.png')
    this.load.image('icones_escolha', 'assets/icones_escolha.png')
    this.load.image('dice', 'assets/dice.png')
    this.load.image('piece_base', 'assets/piece_base.png')
  }

  create() {
    const { width, height } = this.scale

    // Fundo do Menu (Contém a arte com o pergaminho e as placas de madeira)
    this.bgImage = this.add.image(width / 2, height / 2, 'menu_bg').setDisplaySize(width, height)
    
    this.createMainContainer(width, height)
    this.createConfigContainer(width, height)
  }

  private createMainContainer(width: number, height: number) {
    this.mainContainer = this.add.container(0, 0)

    const style = {
      fontSize: '34px', fontFamily: '"Georgia", "Cinzel", serif', color: '#F4EFEA',
      stroke: '#2C1A0D', strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, fill: true }
    }

    // Botão 1 - JOGAR LOCAL
    // Ajustado levemente para baixo e para a direita
    const btnLocal = this.add.text(width * 0.51, height * 0.435, 'JOGAR LOCAL', style)
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      
    btnLocal.on('pointerover', () => {
      btnLocal.setColor('#FFD700')
      this.tweens.add({ targets: btnLocal, scale: 1.05, duration: 100 })
    })
    btnLocal.on('pointerout', () => {
      btnLocal.setColor('#F4EFEA')
      this.tweens.add({ targets: btnLocal, scale: 1.0, duration: 100 })
    })
    btnLocal.on('pointerdown', () => {
      btnLocal.setColor('#B8860B')
      this.tweens.add({ targets: btnLocal, scale: 0.95, duration: 50 })
    })
    btnLocal.on('pointerup', () => {
      btnLocal.setScale(1.0)
      // Mantendo o roteamento interno do nosso jogo para a tela de Config:
      this.bgImage.setTexture('menu_bg_2')
      this.bgImage.setDisplaySize(this.scale.width, this.scale.height)
      this.mainContainer.setVisible(false)
      this.configContainer.setVisible(true)
    })

    // Botão 2 - JOGAR ONLINE
    const btnOnline = this.add.text(width * 0.51, height * 0.565, 'JOGAR ONLINE', style)
      .setOrigin(0.5).setInteractive({ useHandCursor: true })

    btnOnline.on('pointerover', () => {
      btnOnline.setColor('#FFD700')
      this.tweens.add({ targets: btnOnline, scale: 1.05, duration: 100 })
    })
    btnOnline.on('pointerout', () => {
      btnOnline.setColor('#F4EFEA')
      this.tweens.add({ targets: btnOnline, scale: 1.0, duration: 100 })
    })
    btnOnline.on('pointerdown', () => {
      btnOnline.setColor('#B8860B')
      this.tweens.add({ targets: btnOnline, scale: 0.95, duration: 50 })
    })
    btnOnline.on('pointerup', () => {
      btnOnline.setScale(1.0)
      alert('Jogar Online estará disponível em breve!')
    })

    this.mainContainer.add([btnLocal, btnOnline])
  }

  private createConfigContainer(width: number, height: number) {
    this.configContainer = this.add.container(0, 0)
    this.configContainer.setVisible(false)

    // Criar as 4 linhas de seleção
    this.slotUI = []
    // Posições Y estimadas para o centro exato de cada bandeja de madeira
    const yPercents = [0.434, 0.559, 0.684, 0.809]
    
    // Estilo para o texto dentro das bandejas de madeira (precisa ser claro para dar contraste)
    const trayTextStyle = {
      fontSize: '26px', fontFamily: '"Georgia", "Cinzel", serif', color: '#F4EFEA',
      stroke: '#2C1A0D', strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, fill: true }
    }

    for (let i = 0; i < 4; i++) {
      // Texto de status agora centralizado na bandeja (sem os labels VERDE, AMARELO, etc.)
      const typeText = this.add.text(width * 0.53, height * yPercents[i], '', trayTextStyle)
        .setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true })

      const idx = i
      typeText.on('pointerover', () => {
        typeText.setColor('#FFD700') // Tint dourado no hover
        this.tweens.add({ targets: typeText, scale: 1.05, duration: 100 })
      })
      typeText.on('pointerout', () => {
        typeText.setColor('#F4EFEA') // Volta pro natural
        this.tweens.add({ targets: typeText, scale: 1.0, duration: 100 })
      })
      
      const options: PlayerConfigType[] = ['JOGADOR 1', 'JOGADOR 2', 'JOGADOR 3', 'JOGADOR 4', 'ROBÔ', 'VAZIO']
      typeText.on('pointerdown', () => {
        const current = this.slots[idx]
        const nextIdx = (options.indexOf(current) + 1) % options.length
        this.slots[idx] = options[nextIdx]
        this.updateUI()
        // Efeito de afundar no clique
        this.tweens.add({ targets: typeText, scale: 0.95, yoyo: true, duration: 50 })
      })

      this.configContainer.add(typeText)
      this.slotUI.push({ typeText })
    }

    // Botões Inferiores (Nas placas físicas da mesa: Esquerda ~41.5%, Direita ~63.5%, Altura ~95.1%)
    const btnStyle = { fontSize: '28px', fontFamily: '"Georgia", "Cinzel", serif', color: '#F4EFEA', stroke: '#2C1A0D', strokeThickness: 4 }
    
    const btnBack = this.add.text(width * 0.415, height * 0.951, 'VOLTAR', btnStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      
    btnBack.on('pointerover', () => {
      btnBack.setColor('#FFD700')
      this.tweens.add({ targets: btnBack, scale: 1.05, duration: 100 })
    })
    btnBack.on('pointerout', () => {
      btnBack.setColor('#F4EFEA')
      this.tweens.add({ targets: btnBack, scale: 1.0, duration: 100 })
    })
    btnBack.on('pointerdown', () => {
      btnBack.setColor('#B8860B')
      this.tweens.add({ targets: btnBack, scale: 0.95, duration: 50 })
    })
    btnBack.on('pointerup', () => {
      btnBack.setScale(1.0)
      this.bgImage.setTexture('menu_bg')
      this.bgImage.setDisplaySize(this.scale.width, this.scale.height)
      this.configContainer.setVisible(false)
      this.mainContainer.setVisible(true)
    })

    const btnStart = this.add.text(width * 0.635, height * 0.951, 'INICIAR', btnStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      
    // Guarda na propriedade da classe para poder alterar a opacidade no updateUI
    this.btnStart = btnStart

    this.btnStart.on('pointerover', () => {
      this.btnStart.setColor('#FFD700')
      this.tweens.add({ targets: this.btnStart, scale: 1.05, duration: 100 })
    })
    this.btnStart.on('pointerout', () => {
      this.btnStart.setColor('#F4EFEA')
      this.tweens.add({ targets: this.btnStart, scale: 1.0, duration: 100 })
    })
    this.btnStart.on('pointerdown', () => {
      this.btnStart.setColor('#B8860B')
      this.tweens.add({ targets: this.btnStart, scale: 0.95, duration: 50 })
    })
    this.btnStart.on('pointerup', () => {
      this.btnStart.setScale(1.0)
      if (this.slots.filter(s => s !== 'EMPTY').length < 2) return
      const setup: GameSetup = { slots: this.slots }
      this.scene.start('GameScene', setup)
    })

    this.configContainer.add([btnBack, this.btnStart])

    this.updateUI()
  }

  // A função createButton não é mais usada, foi substituída pela geração direta de textos interativos


  private updateUI() {
    let activeCount = 0

    for (let i = 0; i < 4; i++) {
      const { typeText } = this.slotUI[i]
      const type = this.slots[i]

      if (type !== 'VAZIO') activeCount++

      typeText.setText(type)
      
      // O visual de "trancado" / desativado no pergaminho (esmaece a linha toda)
      const alpha = type === 'VAZIO' ? 0.4 : 1
      typeText.setAlpha(alpha)
    }

    // Desabilitar Start se menos de 2 jogadores
    const canStart = activeCount >= 2
    this.btnStart.setAlpha(canStart ? 1 : 0.3)
  }
}
