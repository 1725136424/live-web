import emojiRender from 'emoji-render'

// 获取所有标签
let getAllEmoji = function () {
  return [
    '::ghost', '::smile', '::cry', '::sad', '::fear', '::angry', '::skull',
    '::robot', '::hot', '::cold', '::woozy', '::dizzy', '::nerd', '::confuse',
    '::worry', '::dog', '::cat', '::pig', '::fox', '::wolf', '::mouse', '::owl',
    '::snake', '::dolphin', '::fish', '::butterfly', '::ant', '::ox', '::elephant',
    '::panda', '::strawberry', '::banana', '::orange', '::watermelon', '::grape', '::melon', '::lemon',
    '::mango', '::pear', '::peach', '::cherries', '::tomato', '::coconut', '::avocado',
    '::eggplant', '::potato', '::carrot', '::cucumber', '::broccoli', '::garlic', '::onion',
    '::mushroom', '::chestnut', '::peanuts', '::rocket', '::bus', '::airplane', '::metro',
    '::train', '::bicycle', '::motorcycle', '::car', '::ambulance', '::fire-engine',
    '::violin', '::trumpet', '::guitar', '::saxophone', '::microphone'
  ]
}

export default {
  emojis: function () {
    let ary = []
    for (let i = 0; i < getAllEmoji().length; i++) {
      ary.push(emojiRender(getAllEmoji()[i]))
    }
    return ary
  }
}
