import spinach_rope as r

class Rope:
    def __init__(self, str):
        self.rope = r.rope(str)

    def replace(self, startIndex, length, text):
        self.rope.delete(startIndex, startIndex + length)
        self.rope.insert(startIndex, text)

    def __repr__(self):
        return self.rope.get_str()


tmp = Rope("hello World")

tmp.replace(1, 3, "")
print(tmp)



