import spinach_rope as r

class Rope:
    def __init__(self, str):
        self.rope = r.rope(str)

    def replace(self, startIndex, length, text):
        self.rope.delete(startIndex, startIndex + length)
        print(self)
        self.rope.insert(startIndex, text)

    def __repr__(self):
        return self.rope.get_str()


tmp = Rope("")
tmp.replace(0, 0, "a")
tmp.replace(1, 0, "b")
tmp.replace(1, 0, "c")
print(tmp)

# tmp.replace(0, 1, "c")